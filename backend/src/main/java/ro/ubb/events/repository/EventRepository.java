package ro.ubb.events.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.enums.EventStatus;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByStartTimeAsc();

    List<Event> findAllByOrganizationIdOrderByStartTimeAsc(Long organizationId);

    List<Event> findAllByStatusOrderByStartTimeAsc(EventStatus status);

    List<Event> findAllByOrganizationIdAndStatusOrderByStartTimeAsc(Long organizationId, EventStatus status);

    boolean existsByVenueId(Long venueId);

    /**
     * Loads the event with a database row lock, so that concurrent registrations
     * for the same event are processed one at a time (prevents exceeding the capacity).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
