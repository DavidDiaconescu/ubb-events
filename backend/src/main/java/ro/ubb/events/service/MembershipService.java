package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Membership;
import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.OrgRole;
import ro.ubb.events.domain.enums.OrgStatus;
import ro.ubb.events.dto.membership.CreateMembershipRequest;
import ro.ubb.events.dto.membership.MembershipResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.MembershipRepository;
import ro.ubb.events.repository.OrganizationRepository;
import ro.ubb.events.repository.UserRepository;

import java.time.Instant;
import java.util.List;

/**
 * A membership is never deleted: leaving an organization only marks the membership as inactive,
 * and joining again reactivates the same row (the pair user/organization is unique).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public List<MembershipResponse> findByOrganization(Long organizationId) {
        ensureOrganizationExists(organizationId);
        return membershipRepository.findAllByOrganizationIdOrderByJoinedAtAsc(organizationId).stream()
                .map(MembershipResponse::from)
                .toList();
    }

    public List<MembershipResponse> findByUser(Long userId) {
        ensureUserExists(userId);
        return membershipRepository.findAllByUserIdOrderByJoinedAtAsc(userId).stream()
                .map(MembershipResponse::from)
                .toList();
    }

    public MembershipResponse findById(Long id) {
        return MembershipResponse.from(getMembership(id));
    }

    @Transactional
    public MembershipResponse create(Long organizationId, CreateMembershipRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId));
        if (organization.getStatus() != OrgStatus.ACTIVE) {
            throw new ConflictException("Organization " + organizationId + " is suspended and cannot accept members");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.userId()));

        Membership membership = membershipRepository.findByUserIdAndOrganizationId(user.getId(), organizationId)
                .orElseGet(Membership::new);
        if (membership.isActive()) {
            throw new ConflictException("User " + user.getId() + " is already a member of organization " + organizationId);
        }

        membership.setUser(user);
        membership.setOrganization(organization);
        membership.setRole(request.role());
        membership.setJoinedAt(Instant.now());
        membership.setActive(true);

        return MembershipResponse.from(membershipRepository.save(membership));
    }

    @Transactional
    public MembershipResponse updateRole(Long id, OrgRole role) {
        Membership membership = getMembership(id);
        if (!membership.isActive()) {
            throw new ConflictException("Membership " + id + " is not active");
        }
        membership.setRole(role);
        return MembershipResponse.from(membership);
    }

    @Transactional
    public void deactivate(Long id) {
        Membership membership = getMembership(id);
        membership.setActive(false);
    }

    private Membership getMembership(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", id));
    }

    private void ensureOrganizationExists(Long organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization", organizationId);
        }
    }

    private void ensureUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
    }
}
