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
import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.domain.enums.Visibility;
import ro.ubb.events.dto.registration.RegistrationResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ForbiddenException;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.RegistrationRepository;
import ro.ubb.events.repository.UserRepository;
import ro.ubb.events.security.AccessPolicy;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static ro.ubb.events.TestData.openEvent;
import static ro.ubb.events.TestData.registration;
import static ro.ubb.events.TestData.user;

/**
 * R3 (participant registration): capacity, waitlist, registration period, cancellation and check-in rules,
 * together with the R2 ownership checks of these operations.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RegistrationServiceTest {

    private static final long EVENT_ID = 1L;

    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MembershipRepository membershipRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AccessPolicy accessPolicy;

    @InjectMocks
    private RegistrationService registrationService;

    private final User student = user(5);
    private Event event;

    @BeforeEach
    void setUp() {
        event = openEvent(EVENT_ID, 2);
        when(eventRepository.findByIdForUpdate(EVENT_ID)).thenReturn(Optional.of(event));
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(accessPolicy.currentUser()).thenReturn(student);
        when(accessPolicy.canViewEvent(event)).thenReturn(true);
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ---------------------------------------------------------------- register

    @Test
    void register_withFreePlaces_isConfirmedAndNotified() {
        takenPlaces(1);

        RegistrationResponse response = registrationService.register(EVENT_ID);

        assertThat(response.status()).isEqualTo(RegistrationStatus.CONFIRMED);
        assertThat(response.userId()).isEqualTo(student.getId());
        assertThat(response.waitlistPosition()).isNull();
        verify(notificationService).send(eq(student), eq(event), eq(NotificationType.REGISTRATION_CONFIRMED), anyString());
    }

    @Test
    void register_whenFull_goesToTheEndOfTheWaitlist() {
        takenPlaces(2);
        when(registrationRepository.countByEventIdAndStatus(EVENT_ID, RegistrationStatus.WAITLISTED)).thenReturn(3L);

        RegistrationResponse response = registrationService.register(EVENT_ID);

        assertThat(response.status()).isEqualTo(RegistrationStatus.WAITLISTED);
        assertThat(response.waitlistPosition()).isEqualTo(4);
        verify(notificationService, never()).send(any(), any(), any(), anyString());
    }

    @Test
    void register_generatesReadableCheckInCode() {
        takenPlaces(0);

        RegistrationResponse response = registrationService.register(EVENT_ID);

        assertThat(response.checkInCode()).matches("UBB-[A-HJ-NP-Z2-9]{4}-\\d{2}");
    }

    @Test
    void register_eventNotPublished_isRejected() {
        event.setStatus(EventStatus.REGISTRATION_CLOSED);

        assertThatThrownBy(() -> registrationService.register(EVENT_ID)).isInstanceOf(ConflictException.class);
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void register_outsideRegistrationPeriod_isRejected() {
        event.setRegistrationOpensAt(Instant.now().plus(Duration.ofHours(1)));

        assertThatThrownBy(() -> registrationService.register(EVENT_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("registration period");
    }

    @Test
    void register_membersOnlyEvent_rejectsNonMembers() {
        event.setVisibility(Visibility.MEMBERS_ONLY);
        when(membershipRepository.existsByUserIdAndOrganizationIdAndActiveTrue(5L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> registrationService.register(EVENT_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("members");
    }

    @Test
    void register_twice_isRejected() {
        when(registrationRepository.existsByEventIdAndUserIdAndStatusIn(eq(EVENT_ID), eq(5L), anyCollection()))
                .thenReturn(true);

        assertThatThrownBy(() -> registrationService.register(EVENT_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already registered");
    }

    // ---------------------------------------------------------------- cancel

    @Test
    void cancel_someoneElsesRegistration_isForbidden() {
        Registration registration = registration(10, event, user(6), RegistrationStatus.CONFIRMED);
        stubRegistration(registration);
        when(accessPolicy.isCurrentUser(6L)).thenReturn(false);

        assertThatThrownBy(() -> registrationService.cancel(10L)).isInstanceOf(ForbiddenException.class);
        assertThat(registration.getStatus()).isEqualTo(RegistrationStatus.CONFIRMED);
    }

    @Test
    void cancel_confirmedRegistration_promotesTheFirstUserOnTheWaitlist() {
        Registration own = registration(10, event, student, RegistrationStatus.CONFIRMED);
        Registration waiting = registration(11, event, user(6), RegistrationStatus.WAITLISTED);
        waiting.setWaitlistPosition(1);
        stubRegistration(own);
        when(accessPolicy.isCurrentUser(5L)).thenReturn(true);
        takenPlaces(1); // the place released by the cancellation is free again
        when(registrationRepository.findAllByEventIdAndStatusOrderByWaitlistPositionAsc(EVENT_ID, RegistrationStatus.WAITLISTED))
                .thenReturn(List.of(waiting))
                .thenReturn(List.of()); // after the promotion the waitlist is empty when it is renumbered

        RegistrationResponse response = registrationService.cancel(10L);

        assertThat(response.status()).isEqualTo(RegistrationStatus.CANCELLED);
        assertThat(response.lateCancellation()).isFalse();
        assertThat(waiting.getStatus()).isEqualTo(RegistrationStatus.CONFIRMED);
        assertThat(waiting.getWaitlistPosition()).isNull();
        verify(notificationService).send(eq(waiting.getUser()), eq(event), eq(NotificationType.WAITLIST_PROMOTED), anyString());
    }

    @Test
    void cancel_lessThan24HoursBeforeStart_isMarkedAsLate() {
        event.setStartTime(Instant.now().plus(Duration.ofHours(10)));
        Registration own = registration(10, event, student, RegistrationStatus.CONFIRMED);
        stubRegistration(own);
        when(accessPolicy.isCurrentUser(5L)).thenReturn(true);

        assertThat(registrationService.cancel(10L).lateCancellation()).isTrue();
    }

    @Test
    void cancel_afterTheEventStarted_isRejected() {
        event.setStartTime(Instant.now().minus(Duration.ofMinutes(5)));
        stubRegistration(registration(10, event, student, RegistrationStatus.CONFIRMED));
        when(accessPolicy.isCurrentUser(5L)).thenReturn(true);

        assertThatThrownBy(() -> registrationService.cancel(10L)).isInstanceOf(ConflictException.class);
    }

    // ---------------------------------------------------------------- check-in

    @Test
    void checkIn_byNonManager_isForbidden() {
        doThrow(new ForbiddenException("no")).when(accessPolicy).requireEventManager(event);

        assertThatThrownBy(() -> registrationService.checkIn(EVENT_ID, "UBB-ABCD-12"))
                .isInstanceOf(ForbiddenException.class);
        verify(registrationRepository, never()).findByEventIdAndCheckInCode(any(), any());
    }

    @Test
    void checkIn_codeIsCaseInsensitive_andMarksAttendance() {
        Registration registration = registration(10, event, student, RegistrationStatus.CONFIRMED);
        when(registrationRepository.findByEventIdAndCheckInCode(EVENT_ID, "UBB-ABCD-12"))
                .thenReturn(Optional.of(registration));

        RegistrationResponse response = registrationService.checkIn(EVENT_ID, "  ubb-abcd-12 ");

        assertThat(response.status()).isEqualTo(RegistrationStatus.ATTENDED);
        assertThat(response.checkedInAt()).isNotNull();
    }

    @Test
    void checkIn_twice_isRejected() {
        Registration registration = registration(10, event, student, RegistrationStatus.ATTENDED);
        when(registrationRepository.findByEventIdAndCheckInCode(EVENT_ID, "UBB-ABCD-12"))
                .thenReturn(Optional.of(registration));

        assertThatThrownBy(() -> registrationService.checkIn(EVENT_ID, "UBB-ABCD-12"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already been checked in");
    }

    // ---------------------------------------------------------------- listing

    @Test
    void findByEvent_hidesOtherParticipantsCheckInCodes() {
        Registration own = registration(10, event, student, RegistrationStatus.CONFIRMED);
        Registration other = registration(11, event, user(6), RegistrationStatus.CONFIRMED);
        when(registrationRepository.findAllByEventIdOrderByRegisteredAtAsc(EVENT_ID)).thenReturn(List.of(own, other));
        when(accessPolicy.canManageEvent(event)).thenReturn(false);
        when(accessPolicy.isCurrentUser(5L)).thenReturn(true);

        List<RegistrationResponse> responses = registrationService.findByEvent(EVENT_ID);

        assertThat(responses).extracting(RegistrationResponse::checkInCode).containsExactly("UBB-TEST-10", null);
    }

    @Test
    void findByEvent_showsAllCodesToManagers() {
        Registration other = registration(11, event, user(6), RegistrationStatus.CONFIRMED);
        when(registrationRepository.findAllByEventIdOrderByRegisteredAtAsc(EVENT_ID)).thenReturn(List.of(other));
        when(accessPolicy.canManageEvent(event)).thenReturn(true);

        assertThat(registrationService.findByEvent(EVENT_ID).getFirst().checkInCode()).isEqualTo("UBB-TEST-11");
    }

    @Test
    void checkedInParticipants_keepTheirPlace() {
        when(registrationRepository.countByEventIdAndStatusIn(eq(EVENT_ID), anyCollection())).thenAnswer(invocation -> {
            var statuses = invocation.getArgument(1, java.util.Collection.class);
            assertThat(statuses).containsExactlyInAnyOrder(RegistrationStatus.CONFIRMED, RegistrationStatus.ATTENDED);
            return 2L;
        });

        assertThat(registrationService.countTakenPlaces(EVENT_ID)).isEqualTo(2L);
    }

    private void takenPlaces(long count) {
        when(registrationRepository.countByEventIdAndStatusIn(eq(EVENT_ID), anyCollection())).thenReturn(count);
    }

    private void stubRegistration(Registration registration) {
        when(registrationRepository.findEventIdById(registration.getId())).thenReturn(Optional.of(EVENT_ID));
        when(registrationRepository.findById(registration.getId())).thenReturn(Optional.of(registration));
    }
}
