package com.lolocupcakes.admin.dto;

import com.lolocupcakes.admin.model.AuditLog;
import java.time.Instant;
import java.util.UUID;

public record AuditLogDto(
    UUID id,
    UUID actorUserId,
    String action,
    String entityType,
    String entityId,
    String ipAddress,
    String details,
    Instant createdAt
) {
    public static AuditLogDto fromEntity(AuditLog log) {
        return new AuditLogDto(
            log.getId(),
            log.getActorUserId(),
            log.getAction(),
            log.getEntityType(),
            log.getEntityId(),
            log.getIpAddress(),
            log.getDetails(),
            log.getCreatedAt()
        );
    }
}
