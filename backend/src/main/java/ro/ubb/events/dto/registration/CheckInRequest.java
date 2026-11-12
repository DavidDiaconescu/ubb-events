package ro.ubb.events.dto.registration;

import jakarta.validation.constraints.NotBlank;

public record CheckInRequest(
        @NotBlank String checkInCode
) {
}
