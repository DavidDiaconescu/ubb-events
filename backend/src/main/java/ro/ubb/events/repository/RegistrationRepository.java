package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
}
