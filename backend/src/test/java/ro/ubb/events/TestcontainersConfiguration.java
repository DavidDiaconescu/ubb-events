package ro.ubb.events;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Starts a throw-away PostgreSQL 16 for integration tests and points the datasource at it.
 * Only Docker Desktop needs to be running; {@code docker compose up} is not required.
 * Import it with {@code @Import(TestcontainersConfiguration.class)}; test classes with the same
 * configuration share the cached Spring context, and therefore the same container.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer("postgres:16-alpine");
    }
}
