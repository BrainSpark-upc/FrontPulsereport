export class SbarTransfer {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly sourceNurseId: string,
    public readonly sourceNurseName: string,
    public readonly targetNurseId: string,
    public readonly targetNurseName: string,
    public readonly situation: string,
    public readonly background: string,
    public readonly assessment: string,
    public readonly recommendation: string,
    public readonly transferredAt: Date,
  ) {}
}
