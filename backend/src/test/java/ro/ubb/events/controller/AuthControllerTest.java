package ro.ubb.events.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import ro.ubb.events.TestcontainersConfiguration;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.repository.UserRepository;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AuthControllerTest {

    private static final String EMAIL = "ana.pop@stud.ubbcluj.ro";
    private static final String PASSWORD = "Parola123";
    private static final String BAD_CREDENTIALS = "Email sau parolă greșite";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    // ---------- UC-01 register ----------

    @Test
    void UC01_register_validUbbEmail_returns201() throws Exception {
        register(EMAIL, PASSWORD)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.globalRole").value("USER"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))));
    }

    @Test
    void UC01_register_storesPasswordAsBcryptHash() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());

        String hash = userRepository.findByEmail(EMAIL).orElseThrow().getPasswordHash();
        assertThat(hash).isNotEqualTo(PASSWORD).startsWith("$2");
    }

    @Test
    void BR28_register_duplicateEmail_returns409() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());

        register(EMAIL, PASSWORD).andExpect(status().isConflict());
        register("ANA.Pop@STUD.ubbcluj.ro", PASSWORD).andExpect(status().isConflict());
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void BR28_register_nonUbbEmail_returns400() throws Exception {
        register("ion@gmail.com", PASSWORD)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void UC01_register_weakPassword_returns400() throws Exception {
        register(EMAIL, "parola")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
        register(EMAIL, "Parola1") // 7 characters
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
        register(EMAIL, "parolafaracifre") // long enough, but no digit
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
        assertThat(userRepository.count()).isZero();
    }

    // ---------- UC-02 login ----------

    @Test
    void UC02_login_validCredentials_returnsToken() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());

        String body = login(EMAIL, PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(EMAIL))
                .andReturn().getResponse().getContentAsString();

        Instant expiresAt = Instant.parse(JsonPath.read(body, "$.expiresAt"));
        assertThat(expiresAt).isAfter(Instant.now());
    }

    @Test
    void UC02_login_wrongPassword_returns401() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());

        login(EMAIL, "Gresita123")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value(BAD_CREDENTIALS));
    }

    @Test
    void UC02_login_unknownEmail_returns401() throws Exception {
        login("nimeni@stud.ubbcluj.ro", PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value(BAD_CREDENTIALS));
    }

    @Test
    void UC02_login_disabledUser_returns403() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());
        User user = userRepository.findByEmail(EMAIL).orElseThrow();
        user.setEnabled(false);
        userRepository.save(user);

        login(EMAIL, PASSWORD)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Contul este dezactivat"));
    }

    // ---------- NFR-04 authorization ----------

    @Test
    void NFR04_me_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void NFR04_me_withValidToken_returnsUser() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());
        register("alt.student@stud.ubbcluj.ro", PASSWORD).andExpect(status().isCreated());
        String token = tokenFor(EMAIL, PASSWORD);

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userRepository.findByEmail(EMAIL).orElseThrow().getId()))
                .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    void NFR04_me_withInvalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not.a.valid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void NFR04_protectedEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void NFR04_publicEventList_withoutToken_returns200() throws Exception {
        mockMvc.perform(get("/api/events")).andExpect(status().isOk());
    }

    @Test
    void NFR04_createUser_asNonAdmin_returns403() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());
        String token = tokenFor(EMAIL, PASSWORD);

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("nou@stud.ubbcluj.ro", PASSWORD)))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void NFR04_createUser_asAdmin_returns201() throws Exception {
        register(EMAIL, PASSWORD).andExpect(status().isCreated());
        User admin = userRepository.findByEmail(EMAIL).orElseThrow();
        admin.setGlobalRole(GlobalRole.ADMIN);
        userRepository.save(admin);
        String token = tokenFor(EMAIL, PASSWORD);

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("nou@stud.ubbcluj.ro", PASSWORD)))
                .andExpect(status().isCreated());
    }

    // ---------- helpers ----------

    private ResultActions register(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson(email, password)));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "%s"}
                        """.formatted(email, password)));
    }

    private String tokenFor(String email, String password) throws Exception {
        String body = login(email, password)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.accessToken");
    }

    private static String userJson(String email, String password) {
        return """
                {
                  "email": "%s",
                  "password": "%s",
                  "firstName": "Ana",
                  "lastName": "Pop",
                  "faculty": "Matematică și Informatică",
                  "studyYear": 2
                }
                """.formatted(email, password);
    }
}
