/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { ClinicalEvent, ClinicalEventSeverity } from '../domain/model/clinical-event.entity';
import { ClinicalEventApiEndpoint } from '../infrastructure/clinical-event-api-endpoint';
import { ClinicalEventAssembler } from '../infrastructure/clinical-event-assembler';
import { ClinicalEventResponse } from '../infrastructure/clinical-event-response';
import { PatientStore } from '@patient/application/patient.store';
import { AuditStore } from '@audit/application/audit.store';
import { AuditAction } from '@audit/domain/model/audit-log.entity';
import { IamStore } from '@iam/application/iam.store';
import { NotificationStore } from '@notification/application/notification.store';
import { AlertSeverity } from '@notification/domain/model/alert.entity';

@Injectable({ providedIn: 'root' })
export class ClinicalEventStore {
  private readonly api = inject(ClinicalEventApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);
  private readonly iamStore = inject(IamStore);
  private readonly notifications = inject(NotificationStore);

  private readonly _events = signal<ClinicalEvent[]>([]);
  readonly events = this._events.asReadonly();

  loadEvents(): void {
    this.api.getAll().subscribe(res => {
      const events = ClinicalEventAssembler.toEntityList(res)
        .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

      this._events.set(events);
    });
  }

  registerEvent(form: Omit<ClinicalEventResponse, 'id' | 'patientName' | 'nurseId' | 'nurseName' | 'occurredAt'>): void {
    const patient = this.patients.patients().find(p => p.id === form.patientId);
    const currentUser = this.iamStore.currentUser();

    const request: ClinicalEventResponse = {
      ...form,
      id: crypto.randomUUID(),
      patientName: patient?.fullName ?? 'Paciente no identificado',
      nurseId: currentUser?.id ?? 'system',
      nurseName: currentUser?.fullName ?? 'Sistema',
      occurredAt: new Date().toISOString(),
    };

    this.api.register(request).subscribe(created => {
      const event = ClinicalEventAssembler.toEntity(created);
      this._events.update(list => [event, ...list]);

      this.audit.register(
        AuditAction.BUSINESS_TRANSACTION_EXECUTED,
        `Transacción: evento clínico → alerta si aplica → auditoría para ${event.patientName}`
      );

      this.createAlertWhenNeeded(event);
    });
  }

  private createAlertWhenNeeded(event: ClinicalEvent): void {
    if (event.severity !== ClinicalEventSeverity.HIGH && event.severity !== ClinicalEventSeverity.CRITICAL) return;

    this.notifications.createClinicalAlert({
      patientId: event.patientId,
      patientName: event.patientName,
      title: event.severity === ClinicalEventSeverity.CRITICAL ? 'Evento clínico crítico' : 'Evento clínico de alto riesgo',
      message: `${event.eventType}: ${event.title}. ${event.description}`,
      severity: event.severity === ClinicalEventSeverity.CRITICAL ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
      sourceType: 'CLINICAL_EVENT',
      sourceId: event.id,
    });
  }
}