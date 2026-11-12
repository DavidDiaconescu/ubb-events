package ro.ubb.events.dto.venue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Used both for creating and for updating a venue.
 * The address is optional only for online venues (checked in the service).
 */
public record VenueRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String address,
        @Positive Integer maxCapacity,
        @NotNull Boolean online
) {
}
