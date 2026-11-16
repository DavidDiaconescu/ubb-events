package ro.ubb.events.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.Visibility;
import ro.ubb.events.dto.event.CreateEventRequest;
import ro.ubb.events.dto.event.EventResponse;
import ro.ubb.events.dto.event.UpdateEventRequest;
import ro.ubb.events.dto.event.UpdateEventStatusRequest;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ForbiddenException;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.OrganizationRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;
import ro.ubb.events.repository.VenueRepository;
import ro.ubb.events.security.AccessPolicy;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static ro.ubb.events.TestData.eventWithStatus;
import static ro.ubb.events.TestData.organization;
import static ro.ubb.events.TestData.user;

/**
 * R1 / R4: event creation, editing and the lifecycle, including who may perform each transition (R2).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EventServiceTest {

    private static final long EVENT_ID = 3L;

    @Mock
    private EventRepository eventRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VenueRepository venueRepository;
    @Mock
    private EventOrganizerRepository eventOrganizerRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private RegistrationService registrationService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AccessPolicy accessPolicy;

    @InjectMocks
    private EventService eventService;

    private Event event;

    @BeforeEach
    void setUp() {
        event = eventWithStatus(EVENT_ID, EventStatus.DRAFT);
        when(eventRepository.findByIdForUpdate(EVENT_ID)).thenReturn(Optional.of(event));
    }

    // ---------------------------------------------------------------- lifecycle

    @Test
    void approval_byNonAdmin_isForbidden() {
        event.setStatus(EventStatus.PENDING_APPROVAL);
        doThrow(new ForbiddenException("admins only")).when(accessPolicy).requireAdmin();

        assertThatThrownBy(() -> changeStatus(EventStatus.APPROVED)).isInstanceOf(ForbiddenException.class);
        assertThat(event.getStatus()).isEqualTo(EventStatus.PENDING_APPROVAL);
    }

    @Test
    void rejection_byNonAdmin_isForbidden_evenForTheEventsOrganizers() {
        event.setStatus(EventStatus.PENDING_APPROVAL);
        doThrow(new ForbiddenException("admins only")).when(accessPolicy).requireAdmin();

        assertThatThrownBy(() -> changeStatus(EventStatus.DRAFT)).isInstanceOf(ForbiddenException.class);
        verify(accessPolicy, never()).requireEventManager(any());
    }

    @Test
    void approval_byAdmin_notifiesTheCreator() {
        event.setStatus(EventStatus.PENDING_APPROVAL);

        EventResponse response = changeStatus(EventStatus.APPROVED);

        assertThat(response.status()).isEqualTo(EventStatus.APPROVED);
        verify(notificationService).send(eq(event.getCreatedBy()), eq(event), eq(NotificationType.APPROVAL_RESULT), anyString());
    }

    @Test
    void submitForApproval_byManager_notifiesTheAdministrators() {
        User admin = user(1);
        admin.setGlobalRole(GlobalRole.ADMIN);
        when(userRepository.findAllByGlobalRole(GlobalRole.ADMIN)).thenReturn(List.of(admin));

        EventResponse response = changeStatus(EventStatus.PENDING_APPROVAL);

        assertThat(response.status()).isEqualTo(EventStatus.PENDING_APPROVAL);
        verify(accessPolicy).requireEventManager(event);
        verify(notificationService).sendToAll(eq(List.of(admin)), eq(event), eq(NotificationType.APPROVAL_REQUEST), anyString());
    }

    @Test
    void statusChange_byNonManager_isForbidden() {
        doThrow(new ForbiddenException("no")).when(accessPolicy).requireEventManager(event);

        assertThatThrownBy(() -> changeStatus(EventStatus.PENDING_APPROVAL)).isInstanceOf(ForbiddenException.class);
        assertThat(event.getStatus()).isEqualTo(EventStatus.DRAFT);
    }

    @Test
    void transitionNotInTheLifecycle_isRejected() {
        assertThatThrownBy(() -> changeStatus(EventStatus.PUBLISHED))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("cannot change from DRAFT to PUBLISHED");
    }

    @Test
    void cancellation_requiresAReason() {
        event.setStatus(EventStatus.PUBLISHED);

        assertThatThrownBy(() -> eventService.updateStatus(EVENT_ID, new UpdateEventStatusRequest(EventStatus.CANCELLED, " ")))
                .isInstanceOf(InvalidRequestException.class);
        verify(registrationService, never()).cancelActiveRegistrationsByOrganizer(any());
    }

    @Test
    void cancellation_cancelsActiveRegistrations() {
        event.setStatus(EventStatus.PUBLISHED);

        EventResponse response = eventService.updateStatus(EVENT_ID,
                new UpdateEventStatusRequest(EventStatus.CANCELLED, "  Venue unavailable "));

        assertThat(response.status()).isEqualTo(EventStatus.CANCELLED);
        assertThat(response.cancellationReason()).isEqualTo("Venue unavailable");
        verify(registrationService).cancelActiveRegistrationsByOrganizer(event);
    }

    @Test
    void finishing_marksParticipantsWhoWereNotCheckedInAsAbsent() {
        event.setStatus(EventStatus.ONGOING);

        changeStatus(EventStatus.FINISHED);

        verify(registrationService).markAbsentParticipants(event);
    }

    // ---------------------------------------------------------------- create / update

    @Test
    void create_byUserWhoIsNotCoordinator_isForbidden() {
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization(1)));
        doThrow(new ForbiddenException("coordinators only")).when(accessPolicy).requireCoordinatorOrAdmin(1L);

        assertThatThrownBy(() -> eventService.create(createRequest())).isInstanceOf(ForbiddenException.class);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void create_byCoordinator_isDraftAndCreatorBecomesLeadOrganizer() {
        User coordinator = user(2);
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization(1)));
        when(accessPolicy.currentUser()).thenReturn(coordinator);
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event saved = invocation.getArgument(0);
            saved.setId(50L);
            saved.setVersion(0L);
            return saved;
        });

        EventResponse response = eventService.create(createRequest());

        assertThat(response.status()).isEqualTo(EventStatus.DRAFT);
        assertThat(response.createdById()).isEqualTo(2L);
        verify(eventOrganizerRepository).save(any());
    }

    @Test
    void update_withStaleVersion_isRejected() {
        event.setVersion(4L);

        assertThatThrownBy(() -> eventService.update(EVENT_ID, updateRequest(10, 3L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("modified by someone else");
    }

    @Test
    void update_capacityBelowTakenPlaces_isRejected() {
        when(registrationService.countTakenPlaces(EVENT_ID)).thenReturn(5L);

        assertThatThrownBy(() -> eventService.update(EVENT_ID, updateRequest(3, 0L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("5 places already taken");
    }

    @Test
    void update_byNonManager_isForbidden() {
        doThrow(new ForbiddenException("no")).when(accessPolicy).requireEventManager(event);

        assertThatThrownBy(() -> eventService.update(EVENT_ID, updateRequest(10, 0L)))
                .isInstanceOf(ForbiddenException.class);
    }

    // ---------------------------------------------------------------- visibility

    @Test
    void findAll_hidesEventsTheUserCannotSee() {
        Event draft = eventWithStatus(7, EventStatus.DRAFT);
        Event published = eventWithStatus(8, EventStatus.PUBLISHED);
        when(eventRepository.findAllByOrderByStartTimeAsc()).thenReturn(List.of(draft, published));
        when(accessPolicy.canViewEvent(draft)).thenReturn(false);
        when(accessPolicy.canViewEvent(published)).thenReturn(true);

        assertThat(eventService.findAll(null, null)).extracting(EventResponse::id).containsExactly(8L);
    }

    private EventResponse changeStatus(EventStatus status) {
        return eventService.updateStatus(EVENT_ID, new UpdateEventStatusRequest(status, null));
    }

    private static CreateEventRequest createRequest() {
        Instant start = Instant.now().plus(Duration.ofDays(10));
        return new CreateEventRequest(1L, null, "Workshop", "Description", EventCategory.WORKSHOP,
                start, start.plus(Duration.ofHours(2)), 20,
                Instant.now(), start.minus(Duration.ofDays(1)), Visibility.PUBLIC);
    }

    private static UpdateEventRequest updateRequest(int capacity, long version) {
        Instant start = Instant.now().plus(Duration.ofDays(10));
        return new UpdateEventRequest(null, "Workshop", "Description", EventCategory.WORKSHOP,
                start, start.plus(Duration.ofHours(2)), capacity,
                Instant.now(), start.minus(Duration.ofDays(1)), Visibility.PUBLIC, version);
    }
}
