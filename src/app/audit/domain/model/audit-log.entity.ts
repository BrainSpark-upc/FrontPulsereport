export enum AuditAction {
  VITAL_SIGN_RECORDED = 'VITAL_SIGN_RECORDED',
  CLINICAL_EVENT_REGISTERED = 'CLINICAL_EVENT_REGISTERED',
  SBAR_TRANSFER = 'SBAR_TRANSFER',
  AUDIT_EXECUTED = 'AUDIT_EXECUTED',
  DASHBOARD_ACCESSED = 'DASHBOARD_ACCESSED',
  PATIENT_CREATED = 'PATIENT_CREATED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  ALERT_CREATED = 'ALERT_CREATED',
  ALERT_ACKNOWLEDGED = 'ALERT_ACKNOWLEDGED',
  ALERT_RESOLVED = 'ALERT_RESOLVED',
  BUSINESS_TRANSACTION_EXECUTED = 'BUSINESS_TRANSACTION_EXECUTED',
}

export type AuditedEntityType =
  | 'PATIENT'
  | 'VITAL_SIGNS'
  | 'SBAR_HANDOVER'
  | 'CLINICAL_EVENT'
  | 'ALERT'
  | 'MEDICATION_ORDER'
  | 'CARE_PLAN'
  | 'USER'
  | 'AUDIT_LOG';

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'SIGN'
  | 'HANDOVER'
  | 'ALERT_TRIGGERED'
  | 'ALERT_ACKNOWLEDGED'
  | 'VITAL_SIGNS_RECORDED'
  | 'CLINICAL_NOTE_ADDED';

export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly action: AuditActionType | string,
    public readonly description: string,
    public readonly performedAt: Date,
    public readonly patientId?: string,
    public readonly entityType?: AuditedEntityType | string,
    public readonly entityId?: string,
  ) {}

  get action1Label(): string {
    const labels: Record<string, string> = {
      CREATE: 'Crear',
      UPDATE: this.entityType === 'ALERT' ? 'Alerta cerrada' : 'Actualizar',
      DELETE: 'Eliminar',
      VIEW: 'Consultar',
      SIGN: 'Firmar',
      HANDOVER: 'Traspaso SBAR',
      ALERT_TRIGGERED: 'Alerta generada',
      ALERT_ACKNOWLEDGED: 'Alerta atendida',
      VITAL_SIGNS_RECORDED: 'Signos vitales registrados',
      CLINICAL_NOTE_ADDED: 'Nota clínica agregada',
    };

    return labels[this.action] ?? this.action;
  }
}