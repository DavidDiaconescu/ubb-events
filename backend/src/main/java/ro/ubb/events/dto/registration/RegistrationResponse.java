package ro.ubb.events.dto.registration;

import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.enums.RegistrationStatus;

import java.time.Instant;

public record RegistrationResponse(
        Long id,
        Long eventId,
        Long userId,
        RegistrationStatus status,
        Integer waitlistPosition,
        String checkInCode,
        Instant registeredAt,
        Instant checkedInAt,
        boolean lateCancellation
) {

    /** The same registration with the check-in code hidden (for users other than its owner and the managers). */
    public static RegistrationResponse withoutCheckInCode(Registration registration) {
        RegistrationResponse response = from(registration);
        return new RegistrationResponse(response.id(), response.eventId(), response.userId(), response.status(),
                response.waitlistPosition(), null, response.registeredAt(), response.checkedInAt(),
                response.lateCancellation());
    }

    public static RegistrationResponse from(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getUser().getId(),
                registration.getStatus(),
                registration.getWaitlistPosition(),
                registration.getCheckInCode(),
                registration.getRegisteredAt(),
                registration.getCheckedInAt(),
                registration.isLateCancellation()
        );
    }
}
