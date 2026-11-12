package ro.ubb.events.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFeedbackRequest(
        // TODO: replace with the authenticated user once authentication is implemented
        @NotNull Long userId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 255) String comment,
        @NotNull Boolean anonymous
) {
}
