package ro.ubb.events.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.Visibility;

import java.time.Instant;

public record CreateEventRequest(
        @NotNull Long organizationId,
        Long venueId,
        // TODO: replace with the authenticated user once authentication is implemented
        @NotNull Long createdById,
        @NotBlank @Size(max = 255) String title,
        @NotBlank String description,
        @NotNull EventCategory category,
        @NotNull Instant startTime,
        @NotNull Instant endTime,
        @NotNull @Positive Integer capacity,
        @NotNull Instant registrationOpensAt,
        @NotNull Instant registrationClosesAt,
        @NotNull Visibility visibility
) implements EventDetails {
}
