package ro.ubb.events.dto.membership;

import jakarta.validation.constraints.NotNull;
import ro.ubb.events.domain.enums.OrgRole;

public record CreateMembershipRequest(
        @NotNull Long userId,
        @NotNull OrgRole role
) {
}
