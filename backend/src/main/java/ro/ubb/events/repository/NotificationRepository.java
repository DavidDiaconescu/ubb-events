package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.ubb.events.domain.entity.Notification;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findAllByRecipientIdAndReadFalseOrderByCreatedAtDesc(Long recipientId);

    @Modifying
    @Query("update Notification n set n.read = true where n.recipient.id = :recipientId and n.read = false")
    int markAllAsReadForRecipient(@Param("recipientId") Long recipientId);
}
