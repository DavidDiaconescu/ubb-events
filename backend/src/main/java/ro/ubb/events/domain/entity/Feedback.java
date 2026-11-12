package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "feedback",
        uniqueConstraints = @UniqueConstraint(name = "uq_feedback_event_user", columnNames = {"event_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 1..5, enforced by a CHECK constraint (BR-24). */
    @Column(nullable = false)
    private Integer rating;

    private String comment;

    @Column(nullable = false)
    private boolean anonymous;

    @Column(nullable = false)
    private Instant submittedAt;
}
