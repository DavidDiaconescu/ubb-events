package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.ubb.events.domain.enums.OrganizerRole;

@Entity
@Table(name = "event_organizers",
        uniqueConstraints = @UniqueConstraint(name = "uq_event_organizers_event_user", columnNames = {"event_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class EventOrganizer {

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
    private OrganizerRole role;
}
