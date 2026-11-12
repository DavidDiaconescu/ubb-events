package ro.ubb.events.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.Visibility;

import java.time.Instant;

/**
 * The organization and the creator of an event cannot be changed.
 * {@code version} must be the version the client last read, so that concurrent edits are detected.
 */
public record UpdateEventRequest(
        Long venueId,
        @NotBlank @Size(max = 255) String title,
        @NotBlank String description,
        @NotNull EventCategory category,
        @NotNull Instant startTime,
        @NotNull Instant endTime,
        @NotNull @Positive Integer capacity,
        @NotNull Instant registrationOpensAt,
        @NotNull Instant registrationClosesAt,
        @NotNull Visibility visibility,
        @NotNull Long version
) implements EventDetails {
}
