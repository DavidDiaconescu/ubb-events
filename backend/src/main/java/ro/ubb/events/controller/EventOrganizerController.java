package ro.ubb.events.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.dto.organizer.CreateEventOrganizerRequest;
import ro.ubb.events.dto.organizer.EventOrganizerResponse;
import ro.ubb.events.service.EventOrganizerService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventOrganizerController {

    private final EventOrganizerService eventOrganizerService;

    @GetMapping("/events/{eventId}/organizers")
    public List<EventOrganizerResponse> getByEvent(@PathVariable Long eventId) {
        return eventOrganizerService.findByEvent(eventId);
    }

    @PostMapping("/events/{eventId}/organizers")
    @ResponseStatus(HttpStatus.CREATED)
    public EventOrganizerResponse add(@PathVariable Long eventId,
                                      @Valid @RequestBody CreateEventOrganizerRequest request) {
        return eventOrganizerService.add(eventId, request);
    }

    @DeleteMapping("/event-organizers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long id) {
        eventOrganizerService.remove(id);
    }
}
