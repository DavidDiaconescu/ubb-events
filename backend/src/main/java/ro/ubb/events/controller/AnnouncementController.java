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
import ro.ubb.events.dto.announcement.AnnouncementResponse;
import ro.ubb.events.dto.announcement.CreateAnnouncementRequest;
import ro.ubb.events.service.AnnouncementService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/events/{eventId}/announcements")
    public List<AnnouncementResponse> getByEvent(@PathVariable Long eventId) {
        return announcementService.findByEvent(eventId);
    }

    @PostMapping("/events/{eventId}/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementResponse create(@PathVariable Long eventId,
                                       @Valid @RequestBody CreateAnnouncementRequest request) {
        return announcementService.create(eventId, request);
    }

    @GetMapping("/announcements/{id}")
    public AnnouncementResponse getById(@PathVariable Long id) {
        return announcementService.findById(id);
    }
}
