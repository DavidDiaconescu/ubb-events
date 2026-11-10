package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    /** Id of the affected entity; intentionally not a foreign key (polymorphic reference). */
    @Column(nullable = false)
    private Long entityId;

    @Column(columnDefinition = "text")
    private String details;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
