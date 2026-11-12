package ro.ubb.events.dto.feedback;

import ro.ubb.events.domain.entity.Feedback;

import java.time.Instant;

/**
 * For anonymous feedback the author ({@code userId}) is hidden.
 */
public record FeedbackResponse(
        Long id,
        Long eventId,
        Long userId,
        Integer rating,
        String comment,
        boolean anonymous,
        Instant submittedAt
) {

    public static FeedbackResponse from(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getEvent().getId(),
                feedback.isAnonymous() ? null : feedback.getUser().getId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.isAnonymous(),
                feedback.getSubmittedAt()
        );
    }
}
