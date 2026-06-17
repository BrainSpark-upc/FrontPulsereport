/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { AuditAction, AuditActionType, AuditLog, AuditedEntityType } from '../domain/model/audit-log.entity';
import { AuditApiEndpoint } from '../infrastructure/audit-api-endpoint';
import { AuditAssembler } from '../infrastructure/audit-assembler';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private readonly api = inject(AuditApiEndpoint);
  private readonly iamStore = inject(IamStore);

  private readonly _logs = signal<AuditLog[]>([]);
  readonly logs = this._logs.asReadonly();

  loadLogs(): void {
    this.api.getAll().subscribe(response => {
      const logs = AuditAssembler.toEntityList(response)
        .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());

      this._logs.set(logs);
    });
  }

  register(action: AuditAction, description: string): void {
    const currentUser = this.iamStore.currentUser();
    const context = this.resolveAuditContext(action);

    const request = {
      patientId: null,
      entityType: context.entityType,
      entityId: crypto.randomUUID(),
      actionType: context.actionType,
      performedBy: currentUser?.fullName ?? 'Sistema',
      performedAt: new Date().toISOString(),
      metadata: {
        description,
        source: 'frontend',
      },
    };

    this.api.create(request).subscribe(created => {
      this._logs.update(list => [AuditAssembler.toEntity(created), ...list]);
    });
  }

  private resolveAuditContext(action: AuditAction): { entityType: AuditedEntityType; actionType: AuditActionType } {
    switch (action) {
      case AuditAction.PATIENT_CREATED:
        return { entityType: 'PATIENT', actionType: 'CREATE' };

      case AuditAction.VITAL_SIGN_RECORDED:
        return { entityType: 'VITAL_SIGNS', actionType: 'VITAL_SIGNS_RECORDED' };

      case AuditAction.SBAR_TRANSFER:
        return { entityType: 'SBAR_HANDOVER', actionType: 'HANDOVER' };

      case AuditAction.ALERT_CREATED:
        return { entityType: 'ALERT', actionType: 'ALERT_TRIGGERED' };

      case AuditAction.ALERT_ACKNOWLEDGED:
        return { entityType: 'ALERT', actionType: 'ALERT_ACKNOWLEDGED' };

      case AuditAction.ALERT_RESOLVED:
        return { entityType: 'ALERT', actionType: 'UPDATE' };

      case AuditAction.CLINICAL_EVENT_REGISTERED:
        return { entityType: 'CLINICAL_EVENT', actionType: 'CREATE' };

      case AuditAction.REPORT_GENERATED:
      case AuditAction.DASHBOARD_ACCESSED:
      case AuditAction.AUDIT_EXECUTED:
        return { entityType: 'AUDIT_LOG', actionType: 'VIEW' };

      case AuditAction.BUSINESS_TRANSACTION_EXECUTED:
      default:
        return { entityType: 'AUDIT_LOG', actionType: 'UPDATE' };
    }
  }
}