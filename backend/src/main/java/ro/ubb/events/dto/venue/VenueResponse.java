package ro.ubb.events.dto.venue;

import ro.ubb.events.domain.entity.Venue;

public record VenueResponse(
        Long id,
        String name,
        String address,
        Integer maxCapacity,
        boolean online
) {

    public static VenueResponse from(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getMaxCapacity(),
                venue.isOnline()
        );
    }
}
