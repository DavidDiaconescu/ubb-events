package ro.ubb.events.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Used both for creating and for updating a task.
 */
public record TaskRequest(
        @NotNull Long assigneeId,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 255) String description,
        LocalDate dueDate
) {
}
