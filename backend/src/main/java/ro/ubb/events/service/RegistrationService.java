package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.security.AccessPolicy;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.domain.enums.Visibility;
import ro.ubb.events.dto.registration.RegistrationResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ForbiddenException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Handles registrations, the waitlist and check-in.
 *
 * <p>Every operation that changes the number of confirmed places of an event first locks the event row
 * ({@link EventRepository#findByIdForUpdate}), so concurrent requests cannot exceed the event capacity.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationService {

    /** Registrations that hold a place or a waitlist position (BR-12: at most one per user and event). */
    private static final Set<RegistrationStatus> ACTIVE_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLISTED);

    /** Letters and digits that cannot be confused when read aloud (no I, O, 0, 1). */
    private static final String CHECK_IN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /** Registrations that occupy one of the event places. */
    private static final Set<RegistrationStatus> TAKEN_PLACE_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.ATTENDED);

    /** Cancelling less than this long before the event start is recorded as a late cancellation. */
    private static final Duration LATE_CANCELLATION_WINDOW = Duration.ofHours(24);

    /** Event statuses during which participants can be checked in. */
    private static final Set<EventStatus> CHECK_IN_EVENT_STATUSES =
            EnumSet.of(EventStatus.PUBLISHED, EventStatus.REGISTRATION_CLOSED, EventStatus.ONGOING);

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final NotificationService notificationService;
    private final AccessPolicy accessPolicy;

    /**
     * Every signed-in user sees who is registered (needed for the capacity and the waitlist), but a check-in
     * code is shown only to its owner and to the event's managers, because it proves attendance.
     */
    public List<RegistrationResponse> findByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .filter(accessPolicy::canViewEvent)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        boolean isManager = accessPolicy.canManageEvent(event);
        return registrationRepository.findAllByEventIdOrderByRegisteredAtAsc(eventId).stream()
                .map(registration -> isManager || accessPolicy.isCurrentUser(registration.getUser().getId())
                        ? RegistrationResponse.from(registration)
                        : RegistrationResponse.withoutCheckInCode(registration))
                .toList();
    }

    public List<RegistrationResponse> findByUser(Long userId) {
        accessPolicy.requireSelfOrAdmin(userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
        return registrationRepository.findAllByUserIdOrderByRegisteredAtDesc(userId).stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    public RegistrationResponse findById(Long id) {
        Registration registration = getRegistration(id);
        requireOwnerOrManager(registration);
        return RegistrationResponse.from(registration);
    }

    /**
     * Registers the current user for an event. The registration is CONFIRMED while there are free places,
     * otherwise the user is added at the end of the waitlist.
     */
    @Transactional
    public RegistrationResponse register(Long eventId) {
        User user = accessPolicy.currentUser();
        Event event = lockEvent(eventId);
        if (!accessPolicy.canViewEvent(event)) {
            throw new ResourceNotFoundException("Event", eventId);
        }

        ensureCanRegister(event, user);

        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setCheckInCode(generateCheckInCode());
        registration.setRegisteredAt(Instant.now());
        registration.setLateCancellation(false);

        if (countTakenPlaces(eventId) < event.getCapacity()) {
            registration.setStatus(RegistrationStatus.CONFIRMED);
            notificationService.send(user, event, NotificationType.REGISTRATION_CONFIRMED,
                    "Your registration for '" + event.getTitle() + "' is confirmed.");
        } else {
            long waitlistSize = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.WAITLISTED);
            registration.setStatus(RegistrationStatus.WAITLISTED);
            registration.setWaitlistPosition((int) waitlistSize + 1);
        }

        return RegistrationResponse.from(registrationRepository.save(registration));
    }

    /**
     * Cancellation by the participant. A freed place is given to the first user on the waitlist.
     */
    @Transactional
    public RegistrationResponse cancel(Long id) {
        // Lock the event before loading the registration, so we always read its latest state.
        Long eventId = registrationRepository.findEventIdById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
        Event event = lockEvent(eventId);
        Registration registration = getRegistration(id);
        // Participants cancel their own registration; an administrator may cancel any registration.
        if (!accessPolicy.isAdmin() && !accessPolicy.isCurrentUser(registration.getUser().getId())) {
            throw new ForbiddenException("You can only cancel your own registration");
        }

        if (!ACTIVE_STATUSES.contains(registration.getStatus())) {
            throw new ConflictException("Registration " + id + " cannot be cancelled because its status is "
                    + registration.getStatus());
        }

        Instant now = Instant.now();
        if (!now.isBefore(event.getStartTime())) {
            throw new ConflictException("The event has already started; the registration can no longer be cancelled");
        }

        boolean releasedConfirmedPlace = registration.getStatus() == RegistrationStatus.CONFIRMED;
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setWaitlistPosition(null);
        registration.setLateCancellation(now.isAfter(event.getStartTime().minus(LATE_CANCELLATION_WINDOW)));

        if (releasedConfirmedPlace) {
            fillFreePlacesFromWaitlist(event);
        } else {
            renumberWaitlist(eventId);
        }

        return RegistrationResponse.from(registration);
    }

    @Transactional
    public RegistrationResponse checkIn(Long eventId, String checkInCode) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        accessPolicy.requireEventManager(event);
        if (!CHECK_IN_EVENT_STATUSES.contains(event.getStatus())) {
            throw new ConflictException("Check-in is not possible while the event is " + event.getStatus());
        }

        Registration registration = registrationRepository.findByEventIdAndCheckInCode(eventId, checkInCode.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No registration with this check-in code exists for event " + eventId));

        if (registration.getStatus() == RegistrationStatus.ATTENDED) {
            throw new ConflictException("This participant has already been checked in");
        }
        if (registration.getStatus() != RegistrationStatus.CONFIRMED) {
            throw new ConflictException("Only confirmed registrations can be checked in (current status: "
                    + registration.getStatus() + ")");
        }

        registration.setStatus(RegistrationStatus.ATTENDED);
        registration.setCheckedInAt(Instant.now());
        return RegistrationResponse.from(registration);
    }

    /**
     * Promotes users from the waitlist while the event has free places.
     * The caller must hold the lock on the event row.
     */
    @Transactional
    public void fillFreePlacesFromWaitlist(Event event) {
        long freePlaces = event.getCapacity() - countTakenPlaces(event.getId());

        List<Registration> waitlist = registrationRepository
                .findAllByEventIdAndStatusOrderByWaitlistPositionAsc(event.getId(), RegistrationStatus.WAITLISTED);

        for (Registration registration : waitlist) {
            if (freePlaces <= 0) {
                break;
            }
            registration.setStatus(RegistrationStatus.CONFIRMED);
            registration.setWaitlistPosition(null);
            notificationService.send(registration.getUser(), event, NotificationType.WAITLIST_PROMOTED,
                    "A place became available: your registration for '" + event.getTitle() + "' is now confirmed.");
            freePlaces--;
        }

        renumberWaitlist(event.getId());
    }

    /**
     * Called when an event is cancelled: every active registration is cancelled and its user notified.
     */
    @Transactional
    public void cancelActiveRegistrationsByOrganizer(Event event) {
        List<Registration> activeRegistrations =
                registrationRepository.findAllByEventIdAndStatusIn(event.getId(), ACTIVE_STATUSES);

        for (Registration registration : activeRegistrations) {
            registration.setStatus(RegistrationStatus.CANCELLED_BY_ORGANIZER);
            registration.setWaitlistPosition(null);
            notificationService.send(registration.getUser(), event, NotificationType.EVENT_CANCELLED,
                    "The event '" + event.getTitle() + "' was cancelled. Reason: " + event.getCancellationReason());
        }
    }

    /**
     * Called when an event finishes: confirmed participants who were never checked in are marked as absent.
     */
    @Transactional
    public void markAbsentParticipants(Event event) {
        List<Registration> notCheckedIn =
                registrationRepository.findAllByEventIdAndStatus(event.getId(), RegistrationStatus.CONFIRMED);

        for (Registration registration : notCheckedIn) {
            registration.setStatus(RegistrationStatus.ABSENT);
        }
    }

    /**
     * Places in use: confirmed participants plus those already checked in (a place stays taken after check-in).
     */
    public long countTakenPlaces(Long eventId) {
        return registrationRepository.countByEventIdAndStatusIn(eventId, TAKEN_PLACE_STATUSES);
    }

    /**
     * Users holding a place or a waitlist position for the event.
     */
    public List<User> findActiveParticipants(Long eventId) {
        return registrationRepository.findAllByEventIdAndStatusIn(eventId, ACTIVE_STATUSES).stream()
                .map(Registration::getUser)
                .toList();
    }

    private void ensureCanRegister(Event event, User user) {
        if (!user.isEnabled()) {
            throw new ConflictException("User " + user.getId() + " is disabled");
        }
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ConflictException("Registrations are not accepted while the event is " + event.getStatus());
        }

        Instant now = Instant.now();
        if (now.isBefore(event.getRegistrationOpensAt()) || !now.isBefore(event.getRegistrationClosesAt())) {
            throw new ConflictException("The registration period for this event is not open");
        }

        if (event.getVisibility() == Visibility.MEMBERS_ONLY
                && !membershipRepository.existsByUserIdAndOrganizationIdAndActiveTrue(
                        user.getId(), event.getOrganization().getId())) {
            throw new ConflictException("This event is open only to members of the organization");
        }

        // BR-12: at most one active registration per user and event
        if (registrationRepository.existsByEventIdAndUserIdAndStatusIn(event.getId(), user.getId(), ACTIVE_STATUSES)) {
            throw new ConflictException("User " + user.getId() + " is already registered for event " + event.getId());
        }
    }

    /**
     * Keeps the waitlist positions consecutive (1, 2, 3, ...) after someone leaves the waitlist.
     */
    private void renumberWaitlist(Long eventId) {
        List<Registration> waitlist = registrationRepository
                .findAllByEventIdAndStatusOrderByWaitlistPositionAsc(eventId, RegistrationStatus.WAITLISTED);

        int position = 1;
        for (Registration registration : waitlist) {
            registration.setWaitlistPosition(position++);
        }
    }

    private void requireOwnerOrManager(Registration registration) {
        if (!accessPolicy.isCurrentUser(registration.getUser().getId())
                && !accessPolicy.canManageEvent(registration.getEvent())) {
            throw new ForbiddenException("You are not allowed to see this registration");
        }
    }

    /** A short code that is easy to read out at the entrance, such as "UBB-7K2Q-41" (BR-21: unique). */
    static String generateCheckInCode() {
        StringBuilder code = new StringBuilder("UBB-");
        for (int i = 0; i < 4; i++) {
            code.append(CHECK_IN_ALPHABET.charAt(RANDOM.nextInt(CHECK_IN_ALPHABET.length())));
        }
        return code.append("-").append(RANDOM.nextInt(10)).append(RANDOM.nextInt(10)).toString();
    }

    private Event lockEvent(Long eventId) {
        return eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
    }

    private Registration getRegistration(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
    }
}
