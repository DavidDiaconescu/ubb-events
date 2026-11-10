package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.ubb.events.domain.enums.OrgRole;

import java.time.Instant;

@Entity
@Table(name = "memberships",
        uniqueConstraints = @UniqueConstraint(name = "uq_memberships_user_org", columnNames = {"user_id", "organization_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrgRole role;

    @Column(nullable = false)
    private Instant joinedAt;

    @Column(nullable = false)
    private boolean active;
}
