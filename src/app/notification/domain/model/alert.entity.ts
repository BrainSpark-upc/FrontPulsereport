export enum AlertSeverity {
  MODERATE = 'Moderada',
  CRITICAL = 'Crítica',
}

export enum AlertStatus {
  ACTIVE = 'Activa',
  ACKNOWLEDGED = 'Reconocida',
  RESOLVED = 'Resuelta',
}

export class Alert {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly title: string,
    public readonly message: string,
    public readonly severity: AlertSeverity,
    public readonly status: AlertStatus,
    public readonly triggeredAt: Date,
  ) {}

  get isCritical(): boolean {
    return this.severity === AlertSeverity.CRITICAL;
  }

  get isActive(): boolean {
    return this.status === AlertStatus.ACTIVE;
  }
}
