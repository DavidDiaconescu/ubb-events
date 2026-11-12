package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
