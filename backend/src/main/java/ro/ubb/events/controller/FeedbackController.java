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
import ro.ubb.events.dto.feedback.CreateFeedbackRequest;
import ro.ubb.events.dto.feedback.FeedbackResponse;
import ro.ubb.events.service.FeedbackService;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public List<FeedbackResponse> getByEvent(@PathVariable Long eventId) {
        return feedbackService.findByEvent(eventId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResponse create(@PathVariable Long eventId, @Valid @RequestBody CreateFeedbackRequest request) {
        return feedbackService.create(eventId, request);
    }
}
