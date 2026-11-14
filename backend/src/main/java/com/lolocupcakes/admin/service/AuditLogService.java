package com.lolocupcakes.admin.service;

import com.lolocupcakes.admin.dto.AuditLogDto;
import com.lolocupcakes.admin.model.AuditLog;
import com.lolocupcakes.admin.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(UUID actorUserId, String action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog(actorUserId, action, entityType, entityId, details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(AuditLogDto::fromEntity);
    }
}
