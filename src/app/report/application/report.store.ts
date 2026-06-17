/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Report, ReportStatus } from '../domain/model/report.entity';
import { ReportApiEndpoint } from '../infrastructure/report-api-endpoint';
import { ReportAssembler } from '../infrastructure/report-assembler';
import { ReportResponse } from '../infrastructure/report-response';
import { AuditStore } from '../../audit/application/audit.store';
import { AuditAction } from '../../audit/domain/model/audit-log.entity';
import { IamStore } from '../../iam/application/iam.store';
import { PatientApiEndpoint } from '../../patient/infrastructure/patient-api-endpoint';
import { VitalSignApiEndpoint } from '../../vital-sign/infrastructure/vital-sign-api-endpoint';
import { ClinicalEventApiEndpoint } from '../../clinical-event/infrastructure/clinical-event-api-endpoint';
import { SbarApiEndpoint } from '../../sbar/infrastructure/sbar-api-endpoint';
import { NotificationApiEndpoint } from '../../notification/infrastructure/notification-api-endpoint';
import { AuditApiEndpoint } from '../../audit/infrastructure/audit-api-endpoint';

@Injectable({ providedIn: 'root' })
export class ReportStore {
  private readonly api = inject(ReportApiEndpoint);
  private readonly audit = inject(AuditStore);
  private readonly iamStore = inject(IamStore);
  private readonly patientsApi = inject(PatientApiEndpoint);
  private readonly vitalSignsApi = inject(VitalSignApiEndpoint);
  private readonly eventsApi = inject(ClinicalEventApiEndpoint);
  private readonly sbarApi = inject(SbarApiEndpoint);
  private readonly alertsApi = inject(NotificationApiEndpoint);
  private readonly auditApi = inject(AuditApiEndpoint);
  private readonly _reports = signal<Report[]>([]);
  readonly reports = this._reports.asReadonly();

  loadReports(): void {
    this.api.getAll().subscribe(res => {
      this._reports.set(ReportAssembler.toEntityList(res).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });
  }

  generateReport(form: Pick<ReportResponse, 'type' | 'title' | 'startDate' | 'endDate'>): void {
    const currentUser = this.iamStore.currentUser();

    forkJoin({
      patients: this.patientsApi.getAll(),
      vitalSigns: this.vitalSignsApi.getAll(),
      clinicalEvents: this.eventsApi.getAll(),
      sbarTransfers: this.sbarApi.getAll(),
      alerts: this.alertsApi.getAll(),
      auditLogs: this.auditApi.getAll(),
    }).subscribe(data => {
      const start = new Date(form.startDate).getTime();
      const end = new Date(form.endDate).getTime();
      const inRange = (date: string): boolean => {
        const value = new Date(date).getTime();
        return value >= start && value <= end;
      };

      const vitalSigns = data.vitalSigns.filter(item => inRange(item.recordedAt));
      const clinicalEvents = data.clinicalEvents.filter(item => inRange(item.occurredAt));
      const sbarTransfers = data.sbarTransfers.filter(item => item.transferredAt ? inRange(item.transferredAt) : false);
      const alerts = data.alerts.filter(item => inRange(item.triggeredAt));
      const auditLogs = data.auditLogs.filter(item => inRange(item.performedAt));
      const activeAlerts = alerts.filter(item => item.status !== 'Resuelta');
      const criticalAlerts = alerts.filter(item => item.severity === 'CrÃ­tica' && item.status !== 'Resuelta');

      const request: ReportResponse = {
        ...form,
        id: crypto.randomUUID(),
        generatedBy: currentUser?.fullName ?? 'Sistema',
        status: ReportStatus.COMPLETED,
        createdAt: new Date().toISOString(),
        summary: {
          patients: data.patients.length,
          vitalSigns: vitalSigns.length,
          clinicalEvents: clinicalEvents.length,
          sbarTransfers: sbarTransfers.length,
          activeAlerts: activeAlerts.length,
          criticalAlerts: criticalAlerts.length,
          auditLogs: auditLogs.length,
        },
        clinicalConclusion: this.buildConclusion(vitalSigns.length, clinicalEvents.length, activeAlerts.length, criticalAlerts.length),
      };

      this.api.generate(request).subscribe(created => {
        const report = ReportAssembler.toEntity(created);
        this._reports.update(list => [report, ...list]);
        this.audit.register(AuditAction.REPORT_GENERATED, `GenerÃ³ reporte: ${report.title}`);
        this.audit.register(AuditAction.BUSINESS_TRANSACTION_EXECUTED, `TransacciÃ³n: consolidaciÃ³n de datos clÃ­nicos â†’ reporte â†’ auditorÃ­a`);
      });
    });
  }

  private buildConclusion(vitalSigns: number, events: number, alerts: number, criticalAlerts: number): string {
    if (criticalAlerts > 0) return `Se detectaron ${criticalAlerts} alerta(s) crÃ­tica(s). Requiere revisiÃ³n mÃ©dica prioritaria.`;
    if (alerts > 0) return `Existen ${alerts} alerta(s) activa(s). Mantener seguimiento del turno.`;
    if (vitalSigns > 0 || events > 0) return 'Periodo con actividad clÃ­nica registrada y sin alertas crÃ­ticas activas.';
    return 'No se encontraron movimientos clÃ­nicos relevantes en el periodo seleccionado.';
  }
}
