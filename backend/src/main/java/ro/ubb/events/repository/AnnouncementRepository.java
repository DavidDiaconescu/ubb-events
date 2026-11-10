package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Announcement;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
}
