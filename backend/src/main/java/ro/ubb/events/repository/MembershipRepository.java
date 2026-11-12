package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.Membership;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {

    Optional<Membership> findByUserIdAndOrganizationId(Long userId, Long organizationId);

    boolean existsByUserIdAndOrganizationIdAndActiveTrue(Long userId, Long organizationId);

    List<Membership> findAllByOrganizationIdOrderByJoinedAtAsc(Long organizationId);

    List<Membership> findAllByUserIdOrderByJoinedAtAsc(Long userId);
}
