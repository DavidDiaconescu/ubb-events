package ro.ubb.events.dto.announcement;

import ro.ubb.events.domain.entity.Announcement;
import ro.ubb.events.domain.enums.Audience;

import java.time.Instant;

public record AnnouncementResponse(
        Long id,
        Long eventId,
        Long authorId,
        String title,
        String content,
        Audience audience,
        Instant sentAt
) {

    public static AnnouncementResponse from(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getEvent().getId(),
                announcement.getAuthor().getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getAudience(),
                announcement.getSentAt()
        );
    }
}
