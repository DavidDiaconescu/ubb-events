package ro.ubb.events.dto.organizer;

import jakarta.validation.constraints.NotNull;
import ro.ubb.events.domain.enums.OrganizerRole;

public record CreateEventOrganizerRequest(
        @NotNull Long userId,
        @NotNull OrganizerRole role
) {
}
