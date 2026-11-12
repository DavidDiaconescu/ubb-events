package ro.ubb.events.dto.event;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ro.ubb.events.domain.enums.EventStatus;

/**
 * {@code cancellationReason} is required only when the new status is CANCELLED.
 */
public record UpdateEventStatusRequest(
        @NotNull EventStatus status,
        @Size(max = 255) String cancellationReason
) {
}
