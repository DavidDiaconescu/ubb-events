package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.EventOrganizer;

import java.util.List;

public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Long> {

    List<EventOrganizer> findAllByEventIdOrderByIdAsc(Long eventId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
