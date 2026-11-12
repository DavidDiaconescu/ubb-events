package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Feedback;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByEventIdOrderBySubmittedAtDesc(Long eventId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
