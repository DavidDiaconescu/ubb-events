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

    /**
     * The author of an anonymous review is hidden from everyone except the author, who needs to recognize
     * their own review (for example to know that they have already given feedback).
     */
    public static FeedbackResponse from(Feedback feedback, Long viewerId) {
        Long authorId = feedback.getUser().getId();
        boolean showAuthor = !feedback.isAnonymous() || authorId.equals(viewerId);
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getEvent().getId(),
                showAuthor ? authorId : null,
                feedback.getRating(),
                feedback.getComment(),
                feedback.isAnonymous(),
                feedback.getSubmittedAt()
        );
    }
}
