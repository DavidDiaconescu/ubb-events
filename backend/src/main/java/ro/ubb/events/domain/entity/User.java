package ro.ubb.events.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import ro.ubb.events.domain.enums.GlobalRole;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String faculty;

    @Column(nullable = false)
    private Integer studyYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private GlobalRole globalRole;

    @Column(nullable = false)
    private boolean enabled;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
