package ro.ubb.events.dto.user;

import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;

import java.time.Instant;

/**
 * Public view of a user. The password hash is intentionally never exposed.
 */
public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String faculty,
        Integer studyYear,
        GlobalRole globalRole,
        boolean enabled,
        Instant createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFaculty(),
                user.getStudyYear(),
                user.getGlobalRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
