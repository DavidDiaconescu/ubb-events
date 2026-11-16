package ro.ubb.events.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.OrgRole;
import ro.ubb.events.exception.ForbiddenException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.UserRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static ro.ubb.events.TestData.eventWithStatus;
import static ro.ubb.events.TestData.user;

/**
 * R2: role and ownership checks shared by all services.
 */
@ExtendWith(MockitoExtension.class)
class AccessPolicyTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private MembershipRepository membershipRepository;
    @Mock
    private EventOrganizerRepository eventOrganizerRepository;

    @InjectMocks
    private AccessPolicy accessPolicy;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void visitor_hasNoIdentity() {
        assertThat(accessPolicy.currentUserIdIfAuthenticated()).isEmpty();
        assertThat(accessPolicy.isAdmin()).isFalse();
        assertThatThrownBy(accessPolicy::currentUserId)
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    void authenticatedUser_isTakenFromJwtSubject() {
        signIn(7L, "ROLE_USER");

        assertThat(accessPolicy.currentUserId()).isEqualTo(7L);
        assertThat(accessPolicy.isCurrentUser(7L)).isTrue();
        assertThat(accessPolicy.isCurrentUser(8L)).isFalse();
        assertThat(accessPolicy.isAdmin()).isFalse();
    }

    @Test
    void adminRole_isRecognized() {
        signIn(1L, "ROLE_ADMIN");

        assertThat(accessPolicy.isAdmin()).isTrue();
        assertThatCode(accessPolicy::requireAdmin).doesNotThrowAnyException();
        assertThatCode(() -> accessPolicy.requireSelfOrAdmin(99L)).doesNotThrowAnyException();
    }

    @Test
    void student_cannotPerformAdminOperations() {
        signIn(7L, "ROLE_USER");

        assertThatThrownBy(accessPolicy::requireAdmin).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> accessPolicy.requireSelfOrAdmin(8L)).isInstanceOf(ForbiddenException.class);
        assertThatCode(() -> accessPolicy.requireSelfOrAdmin(7L)).doesNotThrowAnyException();
    }

    @Test
    void disabledAccount_cannotAct() {
        signIn(7L, "ROLE_USER");
        User disabled = user(7);
        disabled.setEnabled(false);
        when(userRepository.findById(7L)).thenReturn(Optional.of(disabled));

        assertThatThrownBy(accessPolicy::currentUser).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void coordinatorOfTheOrganization_canManageItsEvents() {
        signIn(7L, "ROLE_USER");
        Event event = eventWithStatus(3, EventStatus.DRAFT);
        when(membershipRepository.existsByUserIdAndOrganizationIdAndRoleAndActiveTrue(7L, 1L, OrgRole.COORDINATOR))
                .thenReturn(true);

        assertThat(accessPolicy.canManageEvent(event)).isTrue();
        assertThat(accessPolicy.canViewEvent(event)).isTrue();
    }

    @Test
    void eventOrganizer_canManageTheEvent() {
        signIn(7L, "ROLE_USER");
        Event event = eventWithStatus(3, EventStatus.DRAFT);
        when(eventOrganizerRepository.existsByEventIdAndUserId(3L, 7L)).thenReturn(true);

        assertThat(accessPolicy.canManageEvent(event)).isTrue();
    }

    @Test
    void otherStudent_cannotManageOrSeeEventsInPreparation() {
        signIn(7L, "ROLE_USER");

        for (EventStatus status : List.of(EventStatus.DRAFT, EventStatus.PENDING_APPROVAL, EventStatus.APPROVED)) {
            Event event = eventWithStatus(3, status);
            assertThat(accessPolicy.canManageEvent(event)).isFalse();
            assertThat(accessPolicy.canViewEvent(event)).as("status %s", status).isFalse();
            assertThatThrownBy(() -> accessPolicy.requireEventManager(event)).isInstanceOf(ForbiddenException.class);
        }
    }

    @Test
    void publishedEvents_areVisibleToVisitors() {
        for (EventStatus status : List.of(EventStatus.PUBLISHED, EventStatus.REGISTRATION_CLOSED,
                EventStatus.ONGOING, EventStatus.FINISHED, EventStatus.ARCHIVED, EventStatus.CANCELLED)) {
            assertThat(accessPolicy.canViewEvent(eventWithStatus(3, status))).as("status %s", status).isTrue();
        }
    }

    private static void signIn(long userId, String authority) {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "HS256").subject(String.valueOf(userId)).build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority(authority))));
    }
}
