package ro.ubb.events.dto.organization;

import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.enums.OrgStatus;

import java.time.Instant;

public record OrganizationResponse(
        Long id,
        String name,
        String description,
        String logoUrl,
        String contactEmail,
        OrgStatus status,
        Instant createdAt
) {

    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getDescription(),
                organization.getLogoUrl(),
                organization.getContactEmail(),
                organization.getStatus(),
                organization.getCreatedAt()
        );
    }
}
