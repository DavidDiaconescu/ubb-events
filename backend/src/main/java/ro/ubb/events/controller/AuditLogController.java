package ro.ubb.events.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ro.ubb.events.dto.auditlog.AuditLogResponse;
import ro.ubb.events.service.AuditLogService;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public List<AuditLogResponse> getAll(@RequestParam(required = false) String entityType,
                                         @RequestParam(required = false) Long entityId) {
        return auditLogService.findAll(entityType, entityId);
    }

    @GetMapping("/{id}")
    public AuditLogResponse getById(@PathVariable Long id) {
        return auditLogService.findById(id);
    }
}
