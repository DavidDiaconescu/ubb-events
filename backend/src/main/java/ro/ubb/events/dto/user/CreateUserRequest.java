package ro.ubb.events.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import ro.ubb.events.validation.UbbEmail;

/**
 * Used both for self-registration ({@code POST /api/auth/register}) and by admins ({@code POST /api/users}).
 */
public record CreateUserRequest(
        @NotBlank @Email @UbbEmail @Size(max = 255) String email,
        // BCrypt only uses the first 72 bytes of a password
        @NotBlank
        @Size(min = 8, max = 72, message = "Parola trebuie să aibă între 8 și 72 de caractere")
        @Pattern(regexp = "^(?=.*\\p{L})(?=.*\\d).*$",
                message = "Parola trebuie să conțină cel puțin o literă și o cifră")
        String password,
        @NotBlank @Size(max = 255) String firstName,
        @NotBlank @Size(max = 255) String lastName,
        @NotBlank @Size(max = 255) String faculty,
        @NotNull @Positive Integer studyYear
) {
}