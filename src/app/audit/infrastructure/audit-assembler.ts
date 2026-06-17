import { AuditLog } from '../domain/model/audit-log.entity';
import { AuditLogResponse } from './audit-log-response';

export class AuditAssembler {
  static toEntity(response: AuditLogResponse): AuditLog {
    const metadata = this.parseMetadata(response.metadata);

    const description = String(
      metadata?.['description'] ??
      metadata?.['notes'] ??
      `${response.actionType} en ${response.entityType} #${response.entityId}`
    );

    return new AuditLog(
      String(response.id),
      `AL-${String(response.id).padStart(3, '0')}`,
      response.performedBy,
      response.performedBy,
      response.actionType,
      description,
      new Date(response.performedAt),
      response.patientId == null ? undefined : String(response.patientId),
      response.entityType,
      response.entityId,
    );
  }

  static toEntityList(responses: AuditLogResponse[]): AuditLog[] {
    return responses.map(response => this.toEntity(response));
  }

  private static parseMetadata(metadata?: string | Record<string, unknown> | null): Record<string, unknown> | null {
    if (!metadata) return null;

    if (typeof metadata === 'object') {
      return metadata;
    }

    try {
      return JSON.parse(metadata);
    } catch {
      return { description: metadata };
    }
  }
}