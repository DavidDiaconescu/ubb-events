package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByEventIdOrderByIdAsc(Long eventId);

    List<Task> findAllByAssigneeIdOrderByIdAsc(Long assigneeId);
}
