package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
