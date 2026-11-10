package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
}
