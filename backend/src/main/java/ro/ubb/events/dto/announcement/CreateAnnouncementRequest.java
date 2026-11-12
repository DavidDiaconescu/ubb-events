package ro.ubb.events.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ro.ubb.events.domain.enums.Audience;

public record CreateAnnouncementRequest(
        // TODO: replace with the authenticated user once authentication is implemented
        @NotNull Long authorId,
        @NotBlank @Size(max = 255) String title,
        @NotBlank String content,
        @NotNull Audience audience
) {
}
