package ro.ubb.events.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * CORS settings ({@code app.cors.*} in application.properties).
 *
 * @param allowedOrigins browser origins (the frontend) allowed to call the API
 */
@ConfigurationProperties("app.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
