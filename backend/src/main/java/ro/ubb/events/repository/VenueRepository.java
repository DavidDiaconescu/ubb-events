package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}
