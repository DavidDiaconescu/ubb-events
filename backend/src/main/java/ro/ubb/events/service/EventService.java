package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.EventOrganizer;
import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.entity.Venue;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.OrgStatus;
import ro.ubb.events.domain.enums.OrganizerRole;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.dto.event.CreateEventRequest;
import ro.ubb.events.dto.event.EventDetails;
import ro.ubb.events.dto.event.EventResponse;
import ro.ubb.events.dto.event.UpdateEventRequest;
import ro.ubb.events.dto.event.UpdateEventStatusRequest;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.OrganizationRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;
import ro.ubb.events.repository.VenueRepository;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    /**
     * The event lifecycle: for every status, the statuses it may move to.
     * PENDING_APPROVAL -> DRAFT means the event was rejected and sent back to its organizers.
     */
    private static final Map<EventStatus, Set<EventStatus>> ALLOWED_TRANSITIONS = Map.of(
            EventStatus.DRAFT, EnumSet.of(EventStatus.PENDING_APPROVAL, EventStatus.CANCELLED),
            EventStatus.PENDING_APPROVAL, EnumSet.of(EventStatus.APPROVED, EventStatus.DRAFT, EventStatus.CANCELLED),
            EventStatus.APPROVED, EnumSet.of(EventStatus.PUBLISHED, EventStatus.CANCELLED),
            EventStatus.PUBLISHED, EnumSet.of(EventStatus.REGISTRATION_CLOSED, EventStatus.ONGOING, EventStatus.CANCELLED),
            EventStatus.REGISTRATION_CLOSED, EnumSet.of(EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.CANCELLED),
            EventStatus.ONGOING, EnumSet.of(EventStatus.FINISHED),
            EventStatus.FINISHED, EnumSet.of(EventStatus.ARCHIVED),
            EventStatus.ARCHIVED, EnumSet.noneOf(EventStatus.class),
            EventStatus.CANCELLED, EnumSet.noneOf(EventStatus.class)
    );

    /** Statuses in which the event details can still be edited. */
    private static final Set<EventStatus> EDITABLE_STATUSES = EnumSet.of(
            EventStatus.DRAFT,
            EventStatus.PENDING_APPROVAL,
            EventStatus.APPROVED,
            EventStatus.PUBLISHED,
            EventStatus.REGISTRATION_CLOSED
    );

    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationService registrationService;
    private final NotificationService notificationService;

    /**
     * Both filters are optional.
     */
    public List<EventResponse> findAll(Long organizationId, EventStatus status) {
        List<Event> events;
        if (organizationId != null && status != null) {
            events = eventRepository.findAllByOrganizationIdAndStatusOrderByStartTimeAsc(organizationId, status);
        } else if (organizationId != null) {
            events = eventRepository.findAllByOrganizationIdOrderByStartTimeAsc(organizationId);
        } else if (status != null) {
            events = eventRepository.findAllByStatusOrderByStartTimeAsc(status);
        } else {
            events = eventRepository.findAllByOrderByStartTimeAsc();
        }

        return events.stream()
                .map(EventResponse::from)
                .toList();
    }

    public EventResponse findById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return EventResponse.from(event);
    }

    /**
     * Creates the event as a DRAFT; its creator automatically becomes the LEAD organizer.
     */
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        Organization organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization", request.organizationId()));
        if (organization.getStatus() != OrgStatus.ACTIVE) {
            throw new ConflictException("Organization " + organization.getId() + " is suspended and cannot create events");
        }

        User creator = userRepository.findById(request.createdById())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.createdById()));
        if (!creator.isEnabled()) {
            throw new ConflictException("User " + creator.getId() + " is disabled");
        }

        Venue venue = findVenueOrNull(request.venueId());
        validateDetails(request, venue);
        if (!request.startTime().isAfter(Instant.now())) {
            throw new InvalidRequestException("The event must start in the future");
        }

        Event event = new Event();
        event.setOrganization(organization);
        event.setCreatedBy(creator);
        applyDetails(event, request, venue);
        event.setStatus(EventStatus.DRAFT);
        Event savedEvent = eventRepository.save(event);

        EventOrganizer leadOrganizer = new EventOrganizer();
        leadOrganizer.setEvent(savedEvent);
        leadOrganizer.setUser(creator);
        leadOrganizer.setRole(OrganizerRole.LEAD);
        eventOrganizerRepository.save(leadOrganizer);

        return EventResponse.from(savedEvent);
    }

    @Transactional
    public EventResponse update(Long id, UpdateEventRequest request) {
        Event event = lockEvent(id);

        if (!event.getVersion().equals(request.version())) {
            throw new ConflictException("The event was modified by someone else. Reload it and try again.");
        }
        if (!EDITABLE_STATUSES.contains(event.getStatus())) {
            throw new ConflictException("The event cannot be edited while it is " + event.getStatus());
        }

        Venue venue = findVenueOrNull(request.venueId());
        validateDetails(request, venue);

        long confirmedCount = registrationRepository.countByEventIdAndStatus(id, RegistrationStatus.CONFIRMED);
        if (request.capacity() < confirmedCount) {
            throw new ConflictException("The capacity cannot be lower than the " + confirmedCount
                    + " confirmed registrations");
        }

        applyDetails(event, request, venue);

        // A larger capacity may free places for users on the waitlist.
        registrationService.fillFreePlacesFromWaitlist(event);
        notificationService.sendToAll(registrationService.findActiveParticipants(id), event,
                NotificationType.EVENT_UPDATED, "The event '" + event.getTitle() + "' was updated.");

        // Flush so that the response contains the incremented version.
        eventRepository.flush();
        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse updateStatus(Long id, UpdateEventStatusRequest request) {
        Event event = lockEvent(id);
        EventStatus currentStatus = event.getStatus();
        EventStatus newStatus = request.status();

        if (!ALLOWED_TRANSITIONS.get(currentStatus).contains(newStatus)) {
            throw new ConflictException("The event status cannot change from " + currentStatus + " to " + newStatus);
        }

        if (newStatus == EventStatus.CANCELLED) {
            if (request.cancellationReason() == null || request.cancellationReason().isBlank()) {
                throw new InvalidRequestException("A cancellation reason is required");
            }
            event.setCancellationReason(request.cancellationReason().trim());
            registrationService.cancelActiveRegistrationsByOrganizer(event);
        }
        if (newStatus == EventStatus.FINISHED) {
            registrationService.markAbsentParticipants(event);
        }

        event.setStatus(newStatus);
        sendStatusChangeNotifications(event, currentStatus, newStatus);

        // Flush so that the response contains the incremented version.
        eventRepository.flush();
        return EventResponse.from(event);
    }

    private void sendStatusChangeNotifications(Event event, EventStatus oldStatus, EventStatus newStatus) {
        if (newStatus == EventStatus.PENDING_APPROVAL) {
            notificationService.sendToAll(userRepository.findAllByGlobalRole(GlobalRole.ADMIN), event,
                    NotificationType.APPROVAL_REQUEST,
                    "The event '" + event.getTitle() + "' is waiting for approval.");
        }

        if (oldStatus == EventStatus.PENDING_APPROVAL && newStatus == EventStatus.APPROVED) {
            notificationService.send(event.getCreatedBy(), event, NotificationType.APPROVAL_RESULT,
                    "Your event '" + event.getTitle() + "' was approved.");
        }
        if (oldStatus == EventStatus.PENDING_APPROVAL && newStatus == EventStatus.DRAFT) {
            notificationService.send(event.getCreatedBy(), event, NotificationType.APPROVAL_RESULT,
                    "Your event '" + event.getTitle() + "' was not approved and was returned to draft.");
        }
    }

    /**
     * BR-02 .. BR-04 (also enforced by CHECK constraints in the database), plus the venue capacity.
     */
    private static void validateDetails(EventDetails details, Venue venue) {
        if (!details.endTime().isAfter(details.startTime())) {
            throw new InvalidRequestException("The event must end after it starts");
        }
        if (!details.registrationOpensAt().isBefore(details.registrationClosesAt())) {
            throw new InvalidRequestException("Registration must open before it closes");
        }
        if (details.registrationClosesAt().isAfter(details.startTime())) {
            throw new InvalidRequestException("Registration must close before the event starts");
        }
        if (venue != null && venue.getMaxCapacity() != null && details.capacity() > venue.getMaxCapacity()) {
            throw new InvalidRequestException("The capacity exceeds the venue maximum of " + venue.getMaxCapacity());
        }
    }

    private static void applyDetails(Event event, EventDetails details, Venue venue) {
        event.setVenue(venue);
        event.setTitle(details.title());
        event.setDescription(details.description());
        event.setCategory(details.category());
        event.setStartTime(details.startTime());
        event.setEndTime(details.endTime());
        event.setCapacity(details.capacity());
        event.setRegistrationOpensAt(details.registrationOpensAt());
        event.setRegistrationClosesAt(details.registrationClosesAt());
        event.setVisibility(details.visibility());
    }

    private Venue findVenueOrNull(Long venueId) {
        if (venueId == null) {
            return null;
        }
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", venueId));
    }

    private Event lockEvent(Long id) {
        return eventRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }
}
