package ro.ubb.events.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.dto.organization.OrganizationRequest;
import ro.ubb.events.dto.organization.OrganizationResponse;
import ro.ubb.events.dto.organization.UpdateOrganizationStatusRequest;
import ro.ubb.events.service.OrganizationService;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public List<OrganizationResponse> getAll() {
        return organizationService.findAll();
    }

    @GetMapping("/{id}")
    public OrganizationResponse getById(@PathVariable Long id) {
        return organizationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse create(@Valid @RequestBody OrganizationRequest request) {
        return organizationService.create(request);
    }

    @PutMapping("/{id}")
    public OrganizationResponse update(@PathVariable Long id, @Valid @RequestBody OrganizationRequest request) {
        return organizationService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public OrganizationResponse updateStatus(@PathVariable Long id,
                                             @Valid @RequestBody UpdateOrganizationStatusRequest request) {
        return organizationService.updateStatus(id, request.status());
    }
}
