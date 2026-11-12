package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.AuditLog;
import ro.ubb.events.dto.auditlog.AuditLogResponse;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.AuditLogRepository;

import java.util.List;

/**
 * Read-only access to the audit trail.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Without filters returns the whole audit trail; otherwise both {@code entityType}
     * and {@code entityId} must be given and only the entries of that entity are returned.
     */
    public List<AuditLogResponse> findAll(String entityType, Long entityId) {
        boolean hasEntityType = entityType != null && !entityType.isBlank();
        boolean hasEntityId = entityId != null;
        if (hasEntityType != hasEntityId) {
            throw new InvalidRequestException("entityType and entityId must be used together");
        }

        List<AuditLog> auditLogs = hasEntityType
                ? auditLogRepository.findAllByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                : auditLogRepository.findAllByOrderByCreatedAtDesc();

        return auditLogs.stream()
                .map(AuditLogResponse::from)
                .toList();
    }

    public AuditLogResponse findById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log", id));
        return AuditLogResponse.from(auditLog);
    }
}
