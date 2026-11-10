package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
