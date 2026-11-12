package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.enums.OrgStatus;
import ro.ubb.events.dto.organization.OrganizationRequest;
import ro.ubb.events.dto.organization.OrganizationResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.OrganizationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public List<OrganizationResponse> findAll() {
        return organizationRepository.findAll(Sort.by("name")).stream()
                .map(OrganizationResponse::from)
                .toList();
    }

    public OrganizationResponse findById(Long id) {
        return OrganizationResponse.from(getOrganization(id));
    }

    @Transactional
    public OrganizationResponse create(OrganizationRequest request) {
        String name = request.name().trim();
        if (organizationRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("An organization named '" + name + "' already exists");
        }

        Organization organization = new Organization();
        applyDetails(organization, request, name);
        organization.setStatus(OrgStatus.ACTIVE);

        return OrganizationResponse.from(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationRequest request) {
        Organization organization = getOrganization(id);

        String name = request.name().trim();
        if (organizationRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("An organization named '" + name + "' already exists");
        }

        applyDetails(organization, request, name);
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public OrganizationResponse updateStatus(Long id, OrgStatus status) {
        Organization organization = getOrganization(id);
        organization.setStatus(status);
        return OrganizationResponse.from(organization);
    }

    private Organization getOrganization(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));
    }

    private static void applyDetails(Organization organization, OrganizationRequest request, String trimmedName) {
        organization.setName(trimmedName);
        organization.setDescription(request.description());
        organization.setLogoUrl(request.logoUrl());
        organization.setContactEmail(request.contactEmail().trim());
    }
}
