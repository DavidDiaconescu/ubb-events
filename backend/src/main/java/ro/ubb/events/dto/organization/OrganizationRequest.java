package ro.ubb.events.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Used both for creating and for updating an organization.
 */
public record OrganizationRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank String description,
        @Size(max = 255) String logoUrl,
        @NotBlank @Email @Size(max = 255) String contactEmail
) {
}
