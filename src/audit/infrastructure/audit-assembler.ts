import { AuditLog, AuditAction } from '../domain/model/audit-log.entity';
import { AuditLogResponse } from './audit-log-response';

export class AuditAssembler {
  static toEntity(r: AuditLogResponse): AuditLog {
    return new AuditLog(r.id, r.code, r.userId, r.username, r.action as AuditAction, r.description, new Date(r.performedAt));
  }
  static toEntityList(responses: AuditLogResponse[]): AuditLog[] { return responses.map(r => this.toEntity(r)); }
}
