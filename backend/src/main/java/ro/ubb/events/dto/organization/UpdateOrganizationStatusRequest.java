package ro.ubb.events.dto.organization;

import jakarta.validation.constraints.NotNull;
import ro.ubb.events.domain.enums.OrgStatus;

public record UpdateOrganizationStatusRequest(
        @NotNull OrgStatus status
) {
}
