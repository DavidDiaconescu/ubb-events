package ro.ubb.events.dto.notification;

import ro.ubb.events.domain.entity.Notification;
import ro.ubb.events.domain.enums.Channel;
import ro.ubb.events.domain.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        Long recipientId,
        Long eventId,
        NotificationType type,
        Channel channel,
        String message,
        boolean read,
        Instant createdAt
) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                notification.getEvent() != null ? notification.getEvent().getId() : null,
                notification.getType(),
                notification.getChannel(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
