package ro.ubb.events.dto.task;

import ro.ubb.events.domain.entity.Task;
import ro.ubb.events.domain.enums.TaskStatus;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        Long eventId,
        Long assigneeId,
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status
) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getEvent().getId(),
                task.getAssignee().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getStatus()
        );
    }
}
