package ro.ubb.events.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.ubb.events.domain.entity.AuditLog;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findAllByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
