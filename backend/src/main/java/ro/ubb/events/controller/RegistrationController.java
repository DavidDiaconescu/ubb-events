package ro.ubb.events.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.dto.registration.CheckInRequest;
import ro.ubb.events.dto.registration.CreateRegistrationRequest;
import ro.ubb.events.dto.registration.RegistrationResponse;
import ro.ubb.events.service.RegistrationService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/events/{eventId}/registrations")
    public List<RegistrationResponse> getByEvent(@PathVariable Long eventId) {
        return registrationService.findByEvent(eventId);
    }

    @PostMapping("/events/{eventId}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse register(@PathVariable Long eventId,
                                         @Valid @RequestBody CreateRegistrationRequest request) {
        return registrationService.register(eventId, request.userId());
    }

    @PostMapping("/events/{eventId}/check-in")
    public RegistrationResponse checkIn(@PathVariable Long eventId, @Valid @RequestBody CheckInRequest request) {
        return registrationService.checkIn(eventId, request.checkInCode());
    }

    @GetMapping("/users/{userId}/registrations")
    public List<RegistrationResponse> getByUser(@PathVariable Long userId) {
        return registrationService.findByUser(userId);
    }

    @GetMapping("/registrations/{id}")
    public RegistrationResponse getById(@PathVariable Long id) {
        return registrationService.findById(id);
    }

    @PostMapping("/registrations/{id}/cancel")
    public RegistrationResponse cancel(@PathVariable Long id) {
        return registrationService.cancel(id);
    }
}
