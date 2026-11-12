package ro.ubb.events.dto.event;

import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.Visibility;

import java.time.Instant;

public record EventResponse(
        Long id,
        Long organizationId,
        Long venueId,
        Long createdById,
        String title,
        String description,
        EventCategory category,
        Instant startTime,
        Instant endTime,
        Integer capacity,
        Instant registrationOpensAt,
        Instant registrationClosesAt,
        Visibility visibility,
        EventStatus status,
        String cancellationReason,
        Long version,
        Instant createdAt
) {

    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getOrganization().getId(),
                event.getVenue() != null ? event.getVenue().getId() : null,
                event.getCreatedBy().getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCapacity(),
                event.getRegistrationOpensAt(),
                event.getRegistrationClosesAt(),
                event.getVisibility(),
                event.getStatus(),
                event.getCancellationReason(),
                event.getVersion(),
                event.getCreatedAt()
        );
    }
}
