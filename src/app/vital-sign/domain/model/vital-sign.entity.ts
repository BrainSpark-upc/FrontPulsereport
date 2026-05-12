export enum RiskLevel {
  LOW = 'Bajo',
  MEDIUM = 'Medio',
  HIGH = 'Alto',
  CRITICAL = 'Crítico',
}

export class VitalSign {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly nurseId: string,
    public readonly heartRate: number,
    public readonly respiratoryRate: number,
    public readonly systolic: number,
    public readonly diastolic: number,
    public readonly oxygenSaturation: number,
    public readonly temperature: number,
    public readonly riskLevel: RiskLevel,
    public readonly recordedAt: Date,
  ) {}

  get bloodPressureFormatted(): string {
    return `TA ${this.systolic}/${this.diastolic}`;
  }

  get heartRateFormatted(): string {
    return `FC ${this.heartRate}`;
  }

  get respiratoryRateFormatted(): string {
    return `FR ${this.respiratoryRate}`;
  }

  get isCritical(): boolean {
    return this.riskLevel === RiskLevel.CRITICAL;
  }
}
