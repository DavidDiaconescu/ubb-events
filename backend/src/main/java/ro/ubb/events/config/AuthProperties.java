package ro.ubb.events.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.List;

/**
 * Authentication settings ({@code app.auth.*} in application.properties).
 *
 * @param allowedEmailDomains e-mail domains accepted at registration (BR-28)
 * @param jwt                 access-token signing settings
 */
@ConfigurationProperties("app.auth")
public record AuthProperties(List<String> allowedEmailDomains, Jwt jwt) {

    /**
     * @param secret     HS256 signing key, at least 32 bytes
     * @param expiration how long an access token stays valid
     */
    public record Jwt(String secret, Duration expiration) {
    }
}
