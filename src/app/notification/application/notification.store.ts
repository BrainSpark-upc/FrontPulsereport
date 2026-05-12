/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { Alert, AlertSeverity, AlertStatus } from '../domain/model/alert.entity';
import { NotificationApiEndpoint } from '../infrastructure/notification-api-endpoint';
import { AlertAssembler } from '../infrastructure/alert-assembler';
import { AlertResponse } from '../infrastructure/alert-response';
import { AuditStore } from '../../audit/application/audit.store';
import { AuditAction } from '../../audit/domain/model/audit-log.entity';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly api = inject(NotificationApiEndpoint);
  private readonly audit = inject(AuditStore);
  private readonly iamStore = inject(IamStore);
  private _alerts = signal<Alert[]>([]);
  readonly alerts = this._alerts.asReadonly();

  loadAlerts(): void {
    this.api.getAll().subscribe(res => this._alerts.set(AlertAssembler.toEntityList(res).sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())));
  }

  createClinicalAlert(request: Omit<AlertResponse, 'id' | 'status' | 'triggeredAt'>): void {
    const payload: AlertResponse = {
      ...request,
      id: crypto.randomUUID(),
      status: AlertStatus.ACTIVE,
      triggeredAt: new Date().toISOString(),
    };

    this.api.create(payload).subscribe(created => {
      const alert = AlertAssembler.toEntity(created);
      this._alerts.update(list => [alert, ...list]);
      this.audit.register(AuditAction.ALERT_CREATED, `Alerta automática generada para ${alert.patientName}: ${alert.title}`);
    });
  }

  acknowledge(alertId: string): void {
    const currentUser = this.iamStore.currentUser();
    this.api.acknowledge(alertId, currentUser?.fullName ?? 'Sistema').subscribe(updated => {
      const alert = AlertAssembler.toEntity(updated);
      this._alerts.update(list => list.map(a => a.id === alert.id ? alert : a));
      this.audit.register(AuditAction.ALERT_ACKNOWLEDGED, `Reconoció alerta de ${alert.patientName}: ${alert.title}`);
    });
  }

  resolve(alertId: string): void {
    const currentUser = this.iamStore.currentUser();
    this.api.resolve(alertId, currentUser?.fullName ?? 'Sistema').subscribe(updated => {
      const alert = AlertAssembler.toEntity(updated);
      this._alerts.update(list => list.map(a => a.id === alert.id ? alert : a));
      this.audit.register(AuditAction.ALERT_RESOLVED, `Resolvió alerta de ${alert.patientName}: ${alert.title}`);
    });
  }

  filterBy(status: 'Todas' | 'Críticas' | 'Moderadas'): Alert[] {
    const alerts = this._alerts().filter(a => a.status !== AlertStatus.RESOLVED);
    if (status === 'Críticas') return alerts.filter(a => a.severity === AlertSeverity.CRITICAL);
    if (status === 'Moderadas') return alerts.filter(a => a.severity === AlertSeverity.MODERATE);
    return alerts;
  }
}
