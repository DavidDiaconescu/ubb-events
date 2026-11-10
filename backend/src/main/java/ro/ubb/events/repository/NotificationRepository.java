package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
