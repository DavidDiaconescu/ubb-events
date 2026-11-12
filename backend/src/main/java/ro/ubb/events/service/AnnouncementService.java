package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Announcement;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.EventOrganizer;
import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.Audience;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.dto.announcement.AnnouncementResponse;
import ro.ubb.events.dto.announcement.CreateAnnouncementRequest;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.AnnouncementRepository;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Announcements are written by event organizers and delivered as in-app notifications to their audience.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementService {

    /** Everyone registered for the event, including the waitlist, but not those who cancelled. */
    private static final Set<RegistrationStatus> ALL_REGISTERED_STATUSES = EnumSet.of(
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.WAITLISTED,
            RegistrationStatus.ATTENDED,
            RegistrationStatus.ABSENT
    );

    /** Everyone who holds (or held) a confirmed place; the waitlist is excluded. */
    private static final Set<RegistrationStatus> CONFIRMED_STATUSES = EnumSet.of(
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.ATTENDED,
            RegistrationStatus.ABSENT
    );

    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    public List<AnnouncementResponse> findByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", eventId);
        }
        return announcementRepository.findAllByEventIdOrderBySentAtDesc(eventId).stream()
                .map(AnnouncementResponse::from)
                .toList();
    }

    public AnnouncementResponse findById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        return AnnouncementResponse.from(announcement);
    }

    @Transactional
    public AnnouncementResponse create(Long eventId, CreateAnnouncementRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        User author = userRepository.findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.authorId()));

        if (!eventOrganizerRepository.existsByEventIdAndUserId(eventId, author.getId())) {
            throw new InvalidRequestException("Only organizers of the event can publish announcements");
        }

        Announcement announcement = new Announcement();
        announcement.setEvent(event);
        announcement.setAuthor(author);
        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setAudience(request.audience());
        announcement.setSentAt(Instant.now());
        Announcement savedAnnouncement = announcementRepository.save(announcement);

        notificationService.sendToAll(findRecipients(eventId, request.audience()), event,
                NotificationType.ANNOUNCEMENT,
                "New announcement for '" + event.getTitle() + "': " + request.title());

        return AnnouncementResponse.from(savedAnnouncement);
    }

    private List<User> findRecipients(Long eventId, Audience audience) {
        return switch (audience) {
            case ALL_REGISTERED -> findRegisteredUsers(eventId, ALL_REGISTERED_STATUSES);
            case CONFIRMED_ONLY -> findRegisteredUsers(eventId, CONFIRMED_STATUSES);
            case ORGANIZERS -> eventOrganizerRepository.findAllByEventIdOrderByIdAsc(eventId).stream()
                    .map(EventOrganizer::getUser)
                    .toList();
        };
    }

    private List<User> findRegisteredUsers(Long eventId, Set<RegistrationStatus> statuses) {
        return registrationRepository.findAllByEventIdAndStatusIn(eventId, statuses).stream()
                .map(Registration::getUser)
                .distinct()
                .toList();
    }
}
