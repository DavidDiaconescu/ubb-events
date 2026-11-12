package ro.ubb.events.dto.task;

import jakarta.validation.constraints.NotNull;
import ro.ubb.events.domain.enums.TaskStatus;

public record UpdateTaskStatusRequest(
        @NotNull TaskStatus status
) {
}
