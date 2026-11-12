package ro.ubb.events.dto.organizer;

import ro.ubb.events.domain.entity.EventOrganizer;
import ro.ubb.events.domain.enums.OrganizerRole;

public record EventOrganizerResponse(
        Long id,
        Long eventId,
        Long userId,
        OrganizerRole role
) {

    public static EventOrganizerResponse from(EventOrganizer eventOrganizer) {
        return new EventOrganizerResponse(
                eventOrganizer.getId(),
                eventOrganizer.getEvent().getId(),
                eventOrganizer.getUser().getId(),
                eventOrganizer.getRole()
        );
    }
}
