import { Injectable, inject, signal } from "@angular/core";
import {
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "../domain/model/alert.entity";
import { NotificationApiEndpoint } from "../infrastructure/notification-api-endpoint";
import { AlertAssembler } from "../infrastructure/alert-assembler";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";
import { PatientStore } from "@patient/application/patient.store";

const DEFAULT_ACTOR = "Equipo clínico";

interface ClinicalAlertPayload {
  patientId: string;
  patientName?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  sourceType?: string;
  sourceId?: string;
}

interface ManualAlertPayload {
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
}

@Injectable({ providedIn: "root" })
export class NotificationStore {
  private readonly api = inject(NotificationApiEndpoint);
  private readonly audit = inject(AuditStore);
  private readonly patientStore = inject(PatientStore);

  private _alerts = signal<Alert[]>([]);
  readonly alerts = this._alerts.asReadonly();

  loadAlerts(): void {
    this.api.getAll().subscribe((res) => {
      const alerts = AlertAssembler.toEntityList(res, (id) =>
        this.resolvePatientName(id),
      ).sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());

      this._alerts.set(alerts);
    });
  }

  createManualAlert(request: ManualAlertPayload): void {
    const payload = {
      patientId: Number(request.patientId),
      type: request.type,
      severity: this.resolveSeverity(request.severity),
      description: request.description,
      triggeredBy: DEFAULT_ACTOR,
    };

    this.api.create(payload).subscribe((created) => {
      const alert = AlertAssembler.toEntity(
        created,
        this.resolvePatientName(String(created.patientId)),
      );
      this._alerts.update((list) => [alert, ...list]);
      this.audit.register(
        AuditAction.ALERT_CREATED,
        `Creó alerta para ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  createClinicalAlert(request: ClinicalAlertPayload): void {
    const payload = {
      patientId: Number(request.patientId),
      type: this.resolveAlertType(request.sourceType),
      severity: this.resolveSeverity(request.severity),
      description: `${request.title}: ${request.message}`,
      triggeredBy: DEFAULT_ACTOR,
    };

    this.api.create(payload).subscribe((created) => {
      const alert = AlertAssembler.toEntity(
        created,
        request.patientName ??
          this.resolvePatientName(String(created.patientId)),
      );
      this._alerts.update((list) => [alert, ...list]);
      this.audit.register(
        AuditAction.ALERT_CREATED,
        `Alerta generada para ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  acknowledge(alertId: string): void {
    this.api.acknowledge(alertId, DEFAULT_ACTOR).subscribe((updated) => {
      const alert = AlertAssembler.toEntity(
        updated,
        this.resolvePatientName(String(updated.patientId)),
      );
      this._alerts.update((list) =>
        list.map((a) => (a.id === alert.id ? alert : a)),
      );
      this.audit.register(
        AuditAction.ALERT_ACKNOWLEDGED,
        `Atendió alerta de ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  resolve(alertId: string): void {
    this.api.resolve(alertId, DEFAULT_ACTOR).subscribe((updated) => {
      const alert = AlertAssembler.toEntity(
        updated,
        this.resolvePatientName(String(updated.patientId)),
      );
      this._alerts.update((list) =>
        list.map((a) => (a.id === alert.id ? alert : a)),
      );
      this.audit.register(
        AuditAction.ALERT_RESOLVED,
        `Cerró alerta de ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  filterBy(status: "Todas" | "Críticas" | "Moderadas"): Alert[] {
    const alerts = this._alerts().filter(
      (a) => a.status !== AlertStatus.CLOSED,
    );

    if (status === "Críticas") {
      return alerts.filter((a) => a.severity === AlertSeverity.CRITICAL);
    }

    if (status === "Moderadas") {
      return alerts.filter((a) => a.severity !== AlertSeverity.CRITICAL);
    }

    return alerts;
  }

  private resolvePatientName(patientId: string): string {
    return (
      this.patientStore.patients().find((patient) => patient.id === patientId)
        ?.fullName ?? `Paciente #${patientId}`
    );
  }

  private resolveAlertType(sourceType?: string): AlertType {
    if (sourceType === "VITAL_SIGN") return AlertType.RESPIRATORY;
    if (sourceType === "CLINICAL_EVENT") return AlertType.OTHER;
    return AlertType.OTHER;
  }

  private resolveSeverity(severity: AlertSeverity): AlertSeverity {
    if (severity === AlertSeverity.CRITICAL) return AlertSeverity.CRITICAL;
    if (severity === AlertSeverity.HIGH) return AlertSeverity.HIGH;
    if (severity === AlertSeverity.LOW) return AlertSeverity.LOW;
    return AlertSeverity.MEDIUM;
  }
}
