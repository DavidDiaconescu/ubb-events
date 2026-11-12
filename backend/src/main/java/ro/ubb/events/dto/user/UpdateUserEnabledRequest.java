package ro.ubb.events.dto.user;

import jakarta.validation.constraints.NotNull;

public record UpdateUserEnabledRequest(
        @NotNull Boolean enabled
) {
}
