package ro.ubb.events.dto.membership;

import ro.ubb.events.domain.entity.Membership;
import ro.ubb.events.domain.enums.OrgRole;

import java.time.Instant;

public record MembershipResponse(
        Long id,
        Long userId,
        Long organizationId,
        OrgRole role,
        Instant joinedAt,
        boolean active
) {

    public static MembershipResponse from(Membership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getUser().getId(),
                membership.getOrganization().getId(),
                membership.getRole(),
                membership.getJoinedAt(),
                membership.isActive()
        );
    }
}
