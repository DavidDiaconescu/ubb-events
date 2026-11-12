package ro.ubb.events.dto.membership;

import jakarta.validation.constraints.NotNull;
import ro.ubb.events.domain.enums.OrgRole;

public record UpdateMembershipRoleRequest(
        @NotNull OrgRole role
) {
}
