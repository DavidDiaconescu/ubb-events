package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Venue;
import ro.ubb.events.dto.venue.VenueRequest;
import ro.ubb.events.dto.venue.VenueResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.VenueRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;

    public List<VenueResponse> findAll() {
        return venueRepository.findAll(Sort.by("name")).stream()
                .map(VenueResponse::from)
                .toList();
    }

    public VenueResponse findById(Long id) {
        return VenueResponse.from(getVenue(id));
    }

    @Transactional
    public VenueResponse create(VenueRequest request) {
        validate(request);

        Venue venue = new Venue();
        applyDetails(venue, request);

        return VenueResponse.from(venueRepository.save(venue));
    }

    @Transactional
    public VenueResponse update(Long id, VenueRequest request) {
        validate(request);

        Venue venue = getVenue(id);
        applyDetails(venue, request);

        return VenueResponse.from(venue);
    }

    @Transactional
    public void delete(Long id) {
        Venue venue = getVenue(id);
        if (eventRepository.existsByVenueId(id)) {
            throw new ConflictException("Venue " + id + " is used by at least one event and cannot be deleted");
        }
        venueRepository.delete(venue);
    }

    private Venue getVenue(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", id));
    }

    /**
     * Only online venues may be created without an address.
     */
    private static void validate(VenueRequest request) {
        boolean hasAddress = request.address() != null && !request.address().isBlank();
        if (!request.online() && !hasAddress) {
            throw new InvalidRequestException("A physical venue must have an address");
        }
    }

    private static void applyDetails(Venue venue, VenueRequest request) {
        venue.setName(request.name());
        venue.setAddress(request.address());
        venue.setMaxCapacity(request.maxCapacity());
        venue.setOnline(request.online());
    }
}
