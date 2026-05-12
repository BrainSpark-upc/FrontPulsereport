export enum PatientStatusEnum {
  STABLE = 'Estable',
  OBSERVATION = 'En observación',
  UNSTABLE = 'Inestable',
  CRITICAL = 'Crítico',
  DISCHARGED = 'Alta',
}

export class Patient {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentNumber: string,
    public readonly dateOfBirth: Date,
    public readonly gender: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly status: PatientStatusEnum,
    public readonly roomNumber: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const m = today.getMonth() - this.dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) age--;
    return age;
  }

  get requiresMonitoring(): boolean {
    return this.status !== PatientStatusEnum.STABLE && this.status !== PatientStatusEnum.DISCHARGED;
  }
}
