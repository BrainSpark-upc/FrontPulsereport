export enum AuditAction {
  VITAL_SIGN_RECORDED = 'Registró signos vitales',
  CLINICAL_EVENT_REGISTERED = 'Registró evento clínico',
  SBAR_TRANSFER = 'Traspaso SBAR registrado',
  AUDIT_EXECUTED = 'Auditoría de eventos ejecutada',
  DASHBOARD_ACCESSED = 'Dashboard administrativo consultado',
  PATIENT_CREATED = 'Paciente registrado',
  REPORT_GENERATED = 'Reporte generado',
  ALERT_CREATED = 'Alerta automática generada',
  ALERT_ACKNOWLEDGED = 'Alerta reconocida',
  ALERT_RESOLVED = 'Alerta resuelta',
  BUSINESS_TRANSACTION_EXECUTED = 'Transacción clínica ejecutada',
}

export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly action: AuditAction,
    public readonly description: string,
    public readonly performedAt: Date,
  ) {}
}
