package ro.ubb.events.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.dto.membership.CreateMembershipRequest;
import ro.ubb.events.dto.membership.MembershipResponse;
import ro.ubb.events.dto.membership.UpdateMembershipRoleRequest;
import ro.ubb.events.service.MembershipService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping("/organizations/{organizationId}/memberships")
    public List<MembershipResponse> getByOrganization(@PathVariable Long organizationId) {
        return membershipService.findByOrganization(organizationId);
    }

    @PostMapping("/organizations/{organizationId}/memberships")
    @ResponseStatus(HttpStatus.CREATED)
    public MembershipResponse create(@PathVariable Long organizationId,
                                     @Valid @RequestBody CreateMembershipRequest request) {
        return membershipService.create(organizationId, request);
    }

    @GetMapping("/users/{userId}/memberships")
    public List<MembershipResponse> getByUser(@PathVariable Long userId) {
        return membershipService.findByUser(userId);
    }

    @GetMapping("/memberships/{id}")
    public MembershipResponse getById(@PathVariable Long id) {
        return membershipService.findById(id);
    }

    @PatchMapping("/memberships/{id}/role")
    public MembershipResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateMembershipRoleRequest request) {
        return membershipService.updateRole(id, request.role());
    }

    /**
     * Removes the user from the organization by deactivating the membership (the row is kept).
     */
    @DeleteMapping("/memberships/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        membershipService.deactivate(id);
    }
}
