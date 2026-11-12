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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.dto.event.CreateEventRequest;
import ro.ubb.events.dto.event.EventResponse;
import ro.ubb.events.dto.event.UpdateEventRequest;
import ro.ubb.events.dto.event.UpdateEventStatusRequest;
import ro.ubb.events.service.EventService;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public List<EventResponse> getAll(@RequestParam(required = false) Long organizationId,
                                      @RequestParam(required = false) EventStatus status) {
        return eventService.findAll(organizationId, status);
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id) {
        return eventService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody CreateEventRequest request) {
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody UpdateEventRequest request) {
        return eventService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public EventResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateEventStatusRequest request) {
        return eventService.updateStatus(id, request);
    }
}
