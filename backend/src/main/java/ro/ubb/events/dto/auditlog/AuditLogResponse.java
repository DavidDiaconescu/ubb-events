package ro.ubb.events.dto.auditlog;

import ro.ubb.events.domain.entity.AuditLog;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        Long actorId,
        String action,
        String entityType,
        Long entityId,
        String details,
        Instant createdAt
) {

    public static AuditLogResponse from(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getActor().getId(),
                auditLog.getAction(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getDetails(),
                auditLog.getCreatedAt()
        );
    }
}
