package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.enums.RegistrationStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findAllByEventIdOrderByRegisteredAtAsc(Long eventId);

    List<Registration> findAllByUserIdOrderByRegisteredAtDesc(Long userId);

    List<Registration> findAllByEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<Registration> findAllByEventIdAndStatusIn(Long eventId, Collection<RegistrationStatus> statuses);

    List<Registration> findAllByEventIdAndStatusOrderByWaitlistPositionAsc(Long eventId, RegistrationStatus status);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    boolean existsByEventIdAndUserIdAndStatusIn(Long eventId, Long userId, Collection<RegistrationStatus> statuses);

    boolean existsByEventIdAndUserIdAndStatus(Long eventId, Long userId, RegistrationStatus status);

    Optional<Registration> findByEventIdAndCheckInCode(Long eventId, String checkInCode);

    /**
     * Returns only the event id, without loading the registration into the persistence context.
     */
    @Query("select r.event.id from Registration r where r.id = :id")
    Optional<Long> findEventIdById(@Param("id") Long id);
}
