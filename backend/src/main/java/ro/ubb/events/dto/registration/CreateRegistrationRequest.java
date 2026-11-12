package ro.ubb.events.dto.registration;

import jakarta.validation.constraints.NotNull;

public record CreateRegistrationRequest(
        // TODO: replace with the authenticated user once authentication is implemented
        @NotNull Long userId
) {
}
