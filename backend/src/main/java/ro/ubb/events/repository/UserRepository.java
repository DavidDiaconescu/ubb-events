package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
