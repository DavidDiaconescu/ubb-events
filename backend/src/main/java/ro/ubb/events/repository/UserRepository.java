package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    List<User> findAllByGlobalRole(GlobalRole globalRole);
}
