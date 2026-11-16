package ro.ubb.events.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.OrgRole;
import ro.ubb.events.exception.ForbiddenException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.UserRepository;

import java.util.EnumSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * R2: who is the current user and what they may do. The services call it before every protected operation.
 *
 * <p>Actors:</p>
 * <ul>
 *     <li>Administrator: global role ADMIN; may do everything.</li>
 *     <li>Coordinator: an active COORDINATOR member of an organization; creates and manages its events.</li>
 *     <li>Event organizer: a member of an event's organizing team; manages that event.</li>
 *     <li>Student: any other authenticated user; acts only on their own data.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class AccessPolicy {

    /** Events that are still being prepared are visible only to the users who manage them. */
    private static final Set<EventStatus> INTERNAL_STATUSES =
            EnumSet.of(EventStatus.DRAFT, EventStatus.PENDING_APPROVAL, EventStatus.APPROVED);

    private static final String ADMIN_AUTHORITY = "ROLE_ADMIN";

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final EventOrganizerRepository eventOrganizerRepository;

    // ------------------------------------------------------------ identity

    /** The id of the authenticated user (the JWT subject), or empty for a visitor. */
    public Optional<Long> currentUserIdIfAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken token) {
            return Optional.of(Long.valueOf(token.getName()));
        }
        return Optional.empty();
    }

    public Long currentUserId() {
        return currentUserIdIfAuthenticated()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Authentication required"));
    }

    /** The authenticated user; a disabled account cannot perform any operation. */
    public User currentUser() {
        User user = userRepository.findById(currentUserId())
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("The user no longer exists"));
        if (!user.isEnabled()) {
            throw new ForbiddenException("Your account is disabled");
        }
        return user;
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> ADMIN_AUTHORITY.equals(authority.getAuthority()));
    }

    public boolean isCurrentUser(Long userId) {
        return currentUserIdIfAuthenticated().map(id -> id.equals(userId)).orElse(false);
    }

    // ------------------------------------------------------------ checks

    public boolean isCoordinator(Long organizationId) {
        return currentUserIdIfAuthenticated()
                .map(userId -> membershipRepository.existsByUserIdAndOrganizationIdAndRoleAndActiveTrue(
                        userId, organizationId, OrgRole.COORDINATOR))
                .orElse(false);
    }

    public boolean isEventOrganizer(Long eventId) {
        return currentUserIdIfAuthenticated()
                .map(userId -> eventOrganizerRepository.existsByEventIdAndUserId(eventId, userId))
                .orElse(false);
    }

    /** Administrators, coordinators of the organizing organization and the event's organizers. */
    public boolean canManageEvent(Event event) {
        return isAdmin() || isCoordinator(event.getOrganization().getId()) || isEventOrganizer(event.getId());
    }

    /** Events in preparation (draft, pending approval, approved) are hidden from everyone who cannot manage them. */
    public boolean canViewEvent(Event event) {
        return !INTERNAL_STATUSES.contains(event.getStatus()) || canManageEvent(event);
    }

    // ------------------------------------------------------------ requirements (throw 403)

    public void requireAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenException("Only an administrator can do this");
        }
    }

    public void requireCoordinatorOrAdmin(Long organizationId) {
        if (!isAdmin() && !isCoordinator(organizationId)) {
            throw new ForbiddenException("Only coordinators of the organization can do this");
        }
    }

    public void requireEventManager(Event event) {
        if (!canManageEvent(event)) {
            throw new ForbiddenException("You are not allowed to manage this event");
        }
    }

    /** The user may act on their own data; an administrator may act on anyone's. */
    public void requireSelfOrAdmin(Long userId) {
        if (!isAdmin() && !isCurrentUser(userId)) {
            throw new ForbiddenException("You can only access your own data");
        }
    }

    public void requireSelf(Long userId) {
        if (!Objects.equals(currentUserId(), userId)) {
            throw new ForbiddenException("You can only access your own data");
        }
    }
}
