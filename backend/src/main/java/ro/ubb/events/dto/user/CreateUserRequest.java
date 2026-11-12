package ro.ubb.events.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Email @Size(max = 255) String email,
        // BCrypt only uses the first 72 bytes of a password
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 255) String firstName,
        @NotBlank @Size(max = 255) String lastName,
        @NotBlank @Size(max = 255) String faculty,
        @NotNull @Positive Integer studyYear
) {
}
