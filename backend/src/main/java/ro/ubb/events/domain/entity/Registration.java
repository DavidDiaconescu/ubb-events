package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.ubb.events.domain.enums.RegistrationStatus;

import java.time.Instant;

/**
 * At most one active (CONFIRMED / WAITLISTED) registration per (event, user) is enforced
 * by a partial unique index in the Flyway migration (BR-12).
 */
@Entity
@Table(name = "registrations")
@Getter
@Setter
@NoArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RegistrationStatus status;

    private Integer waitlistPosition;

    @Column(nullable = false, unique = true)
    private String checkInCode;

    @Column(nullable = false)
    private Instant registeredAt;

    private Instant checkedInAt;

    @Column(nullable = false)
    private boolean lateCancellation;
}
