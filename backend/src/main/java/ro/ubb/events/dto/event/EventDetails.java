package ro.ubb.events.dto.event;

import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.Visibility;

import java.time.Instant;

/**
 * The editable details shared by the create and update event requests,
 * so that both can be validated and applied by the same code.
 */
public interface EventDetails {

    Long venueId();

    String title();

    String description();

    EventCategory category();

    Instant startTime();

    Instant endTime();

    Integer capacity();

    Instant registrationOpensAt();

    Instant registrationClosesAt();

    Visibility visibility();
}
