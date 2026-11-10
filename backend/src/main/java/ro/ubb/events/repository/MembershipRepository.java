package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Membership;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
}
