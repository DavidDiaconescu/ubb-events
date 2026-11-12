package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.Feedback;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.dto.feedback.CreateFeedbackRequest;
import ro.ubb.events.dto.feedback.FeedbackResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.FeedbackRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Feedback can be given once per event (BR-24), after the event has finished,
 * and only by participants who were checked in.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackService {

    private static final Set<EventStatus> FEEDBACK_EVENT_STATUSES =
            EnumSet.of(EventStatus.FINISHED, EventStatus.ARCHIVED);

    private final FeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    public List<FeedbackResponse> findByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", eventId);
        }
        return feedbackRepository.findAllByEventIdOrderBySubmittedAtDesc(eventId).stream()
                .map(FeedbackResponse::from)
                .toList();
    }

    @Transactional
    public FeedbackResponse create(Long eventId, CreateFeedbackRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.userId()));

        if (!FEEDBACK_EVENT_STATUSES.contains(event.getStatus())) {
            throw new ConflictException("Feedback can only be given after the event has finished");
        }
        if (!registrationRepository.existsByEventIdAndUserIdAndStatus(eventId, user.getId(), RegistrationStatus.ATTENDED)) {
            throw new ConflictException("Only participants who attended the event can give feedback");
        }
        if (feedbackRepository.existsByEventIdAndUserId(eventId, user.getId())) {
            throw new ConflictException("User " + user.getId() + " has already given feedback for event " + eventId);
        }

        Feedback feedback = new Feedback();
        feedback.setEvent(event);
        feedback.setUser(user);
        feedback.setRating(request.rating());
        feedback.setComment(request.comment());
        feedback.setAnonymous(request.anonymous());
        feedback.setSubmittedAt(Instant.now());

        return FeedbackResponse.from(feedbackRepository.save(feedback));
    }
}
