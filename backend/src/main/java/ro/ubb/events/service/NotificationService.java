package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.Notification;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.Channel;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.dto.notification.NotificationResponse;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.NotificationRepository;
import ro.ubb.events.repository.UserRepository;

import java.util.Collection;
import java.util.List;

/**
 * Stores in-app notifications. Other services call {@link #send} / {@link #sendToAll}
 * whenever something relevant for a user happens.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    /** Length of the {@code notifications.message} column. */
    private static final int MAX_MESSAGE_LENGTH = 255;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponse> findByRecipient(Long recipientId, boolean unreadOnly) {
        ensureUserExists(recipientId);

        List<Notification> notifications = unreadOnly
                ? notificationRepository.findAllByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId)
                : notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(recipientId);

        return notifications.stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = getNotification(id);
        notification.setRead(true);
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {
        ensureUserExists(recipientId);
        notificationRepository.markAllAsReadForRecipient(recipientId);
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.delete(getNotification(id));
    }

    /**
     * Creates an in-app notification for one user. {@code event} may be {@code null}.
     */
    @Transactional
    public void send(User recipient, Event event, NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setEvent(event);
        notification.setType(type);
        notification.setChannel(Channel.IN_APP);
        notification.setMessage(truncate(message));
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendToAll(Collection<User> recipients, Event event, NotificationType type, String message) {
        for (User recipient : recipients) {
            send(recipient, event, type, message);
        }
    }

    private Notification getNotification(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
    }

    private void ensureUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
    }

    private static String truncate(String message) {
        if (message.length() <= MAX_MESSAGE_LENGTH) {
            return message;
        }
        return message.substring(0, MAX_MESSAGE_LENGTH - 3) + "...";
    }
}
