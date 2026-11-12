package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.EventOrganizer;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.dto.organizer.CreateEventOrganizerRequest;
import ro.ubb.events.dto.organizer.EventOrganizerResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventOrganizerService {

    private final EventOrganizerRepository eventOrganizerRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public List<EventOrganizerResponse> findByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", eventId);
        }
        return eventOrganizerRepository.findAllByEventIdOrderByIdAsc(eventId).stream()
                .map(EventOrganizerResponse::from)
                .toList();
    }

    @Transactional
    public EventOrganizerResponse add(Long eventId, CreateEventOrganizerRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.userId()));

        if (!user.isEnabled()) {
            throw new ConflictException("User " + user.getId() + " is disabled");
        }
        if (eventOrganizerRepository.existsByEventIdAndUserId(eventId, user.getId())) {
            throw new ConflictException("User " + user.getId() + " is already an organizer of event " + eventId);
        }

        EventOrganizer eventOrganizer = new EventOrganizer();
        eventOrganizer.setEvent(event);
        eventOrganizer.setUser(user);
        eventOrganizer.setRole(request.role());

        return EventOrganizerResponse.from(eventOrganizerRepository.save(eventOrganizer));
    }

    @Transactional
    public void remove(Long id) {
        EventOrganizer eventOrganizer = eventOrganizerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event organizer", id));
        eventOrganizerRepository.delete(eventOrganizer);
    }
}
