package ro.ubb.events.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import ro.ubb.events.TestcontainersConfiguration;
import ro.ubb.events.domain.entity.Membership;
import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.domain.enums.OrgRole;
import ro.ubb.events.domain.enums.OrgStatus;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.OrganizationRepository;
import ro.ubb.events.repository.UserRepository;

import java.time.Duration;
import java.time.Instant;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * R2 end to end: the REST API takes the user from the JWT and enforces the role of every actor
 * (student, coordinator, administrator) on a real PostgreSQL database.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private MembershipRepository membershipRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User admin;
    private User coordinator;
    private User student;
    private User otherStudent;
    private Organization organization;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        admin = saveUser("admin@ubbcluj.ro", GlobalRole.ADMIN);
        coordinator = saveUser("coordinator@stud.ubbcluj.ro", GlobalRole.USER);
        student = saveUser("student@stud.ubbcluj.ro", GlobalRole.USER);
        otherStudent = saveUser("other@stud.ubbcluj.ro", GlobalRole.USER);

        organization = new Organization();
        organization.setName("Tech Society");
        organization.setDescription("Software and hardware");
        organization.setContactEmail("tech@example.com");
        organization.setStatus(OrgStatus.ACTIVE);
        organization = organizationRepository.save(organization);

        Membership membership = new Membership();
        membership.setUser(coordinator);
        membership.setOrganization(organization);
        membership.setRole(OrgRole.COORDINATOR);
        membership.setJoinedAt(Instant.now());
        membership.setActive(true);
        membershipRepository.save(membership);
    }

    @AfterEach
    void cleanDatabase() {
        // Leaves an empty database for the other integration tests that share the container.
        jdbcTemplate.execute("TRUNCATE users, organizations, venues RESTART IDENTITY CASCADE");
    }

    @Test
    void visitor_cannotCallProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/events/1/registrations")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/organizations")).andExpect(status().isOk());
    }

    @Test
    void onlyCoordinatorsCanCreateEvents_andTheCreatorComesFromTheToken() throws Exception {
        perform(post("/api/events").content(eventJson()), student).andExpect(status().isForbidden());

        perform(post("/api/events").content(eventJson()), coordinator)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdById").value(coordinator.getId()))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void draftsAreHiddenFromStudents() throws Exception {
        long eventId = createEvent();

        perform(get("/api/events"), student).andExpect(jsonPath("$[*].id", not(hasItem((int) eventId))));
        perform(get("/api/events/" + eventId), student).andExpect(status().isNotFound());
        perform(get("/api/events/" + eventId), coordinator).andExpect(status().isOk());
        mockMvc.perform(get("/api/events/" + eventId)).andExpect(status().isNotFound());
    }

    @Test
    void lifecycle_eachTransitionIsReservedToTheRightActor() throws Exception {
        long eventId = createEvent();

        changeStatus(eventId, "PENDING_APPROVAL", student).andExpect(status().isForbidden());
        changeStatus(eventId, "PENDING_APPROVAL", coordinator).andExpect(status().isOk());

        changeStatus(eventId, "APPROVED", coordinator).andExpect(status().isForbidden());
        changeStatus(eventId, "APPROVED", admin).andExpect(status().isOk());

        changeStatus(eventId, "PUBLISHED", student).andExpect(status().isForbidden());
        changeStatus(eventId, "PUBLISHED", coordinator)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    void registration_belongsToTheAuthenticatedUser() throws Exception {
        long eventId = publishedEvent();

        String body = perform(post("/api/events/" + eventId + "/registrations"), student)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(student.getId()))
                .andReturn().getResponse().getContentAsString();
        int registrationId = JsonPath.read(body, "$.id");

        // Another student can neither cancel it nor see its check-in code.
        perform(post("/api/registrations/" + registrationId + "/cancel"), otherStudent).andExpect(status().isForbidden());
        perform(get("/api/events/" + eventId + "/registrations"), otherStudent)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].checkInCode").doesNotExist());
        perform(get("/api/events/" + eventId + "/registrations"), coordinator)
                .andExpect(jsonPath("$[0].checkInCode").isString());

        // Only the event's managers can check participants in.
        perform(post("/api/events/" + eventId + "/check-in").content("{\"checkInCode\":\"UBB-AAAA-00\"}"), otherStudent)
                .andExpect(status().isForbidden());

        perform(post("/api/registrations/" + registrationId + "/cancel"), student)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void notificationsArePrivate() throws Exception {
        perform(get("/api/users/" + student.getId() + "/notifications"), student).andExpect(status().isOk());
        perform(get("/api/users/" + student.getId() + "/notifications"), otherStudent).andExpect(status().isForbidden());
        perform(get("/api/users/" + student.getId() + "/notifications"), admin).andExpect(status().isForbidden());
    }

    @Test
    void administrationIsReservedToAdmins() throws Exception {
        String venue = "{\"name\":\"Aula\",\"address\":\"Str. Kogalniceanu 1\",\"maxCapacity\":100,\"online\":false}";
        perform(post("/api/venues").content(venue), coordinator).andExpect(status().isForbidden());
        perform(post("/api/venues").content(venue), admin).andExpect(status().isCreated());

        String suspend = "{\"status\":\"SUSPENDED\"}";
        perform(patch("/api/organizations/" + organization.getId() + "/status").content(suspend), coordinator)
                .andExpect(status().isForbidden());
        perform(patch("/api/users/" + student.getId() + "/enabled").content("{\"enabled\":false}"), coordinator)
                .andExpect(status().isForbidden());
        perform(patch("/api/users/" + admin.getId() + "/enabled").content("{\"enabled\":false}"), admin)
                .andExpect(status().isConflict());
    }

    @Test
    void studentsJoinOrganizationsOnlyAsThemselvesAndAsMembers() throws Exception {
        String url = "/api/organizations/" + organization.getId() + "/memberships";

        perform(post(url).content(membershipJson(student, "COORDINATOR")), student).andExpect(status().isForbidden());
        perform(post(url).content(membershipJson(otherStudent, "MEMBER")), student).andExpect(status().isForbidden());
        perform(post(url).content(membershipJson(student, "MEMBER")), student).andExpect(status().isCreated());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions perform(MockHttpServletRequestBuilder request, User user) throws Exception {
        String authority = "ROLE_" + user.getGlobalRole().name();
        return mockMvc.perform(request
                .contentType(MediaType.APPLICATION_JSON)
                .with(jwt().jwt(token -> token.subject(String.valueOf(user.getId())))
                        .authorities(new SimpleGrantedAuthority(authority))));
    }

    private ResultActions changeStatus(long eventId, String status, User user) throws Exception {
        return perform(patch("/api/events/" + eventId + "/status").content("{\"status\":\"" + status + "\"}"), user);
    }

    private long createEvent() throws Exception {
        String body = perform(post("/api/events").content(eventJson()), coordinator)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private long publishedEvent() throws Exception {
        long eventId = createEvent();
        changeStatus(eventId, "PENDING_APPROVAL", coordinator).andExpect(status().isOk());
        changeStatus(eventId, "APPROVED", admin).andExpect(status().isOk());
        changeStatus(eventId, "PUBLISHED", coordinator).andExpect(status().isOk());
        return eventId;
    }

    /** Registration opened an hour ago and closes tomorrow; the event is in two days. */
    private String eventJson() {
        Instant now = Instant.now();
        Instant start = now.plus(Duration.ofDays(2));
        return """
                {"organizationId": %d, "venueId": null, "title": "Spring Boot Workshop",
                 "description": "Hands-on", "category": "WORKSHOP",
                 "startTime": "%s", "endTime": "%s", "capacity": 10,
                 "registrationOpensAt": "%s", "registrationClosesAt": "%s", "visibility": "PUBLIC"}
                """.formatted(organization.getId(), start, start.plus(Duration.ofHours(3)),
                now.minus(Duration.ofHours(1)), now.plus(Duration.ofDays(1)));
    }

    private static String membershipJson(User user, String role) {
        return "{\"userId\":" + user.getId() + ",\"role\":\"" + role + "\"}";
    }

    private User saveUser(String email, GlobalRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("not-used-in-this-test");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setFaculty("FMI");
        user.setStudyYear(2);
        user.setGlobalRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }
}
