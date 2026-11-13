package ro.ubb.events.dto.auth;

import ro.ubb.events.dto.user.UserResponse;

import java.time.Instant;

/**
 * Result of a successful login: send {@code accessToken} as {@code Authorization: Bearer <token>}.
 */
public record LoginResponse(String accessToken, String tokenType, Instant expiresAt, UserResponse user) {

    public static LoginResponse bearer(String accessToken, Instant expiresAt, UserResponse user) {
        return new LoginResponse(accessToken, "Bearer", expiresAt, user);
    }
}
