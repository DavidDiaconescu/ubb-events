package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.EventOrganizer;

public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Long> {
}
