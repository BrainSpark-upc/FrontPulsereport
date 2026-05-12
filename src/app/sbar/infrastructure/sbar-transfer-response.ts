export interface SbarTransferResponse {
  id: string; patientId: string; patientName: string;
  sourceNurseId: string; sourceNurseName: string; targetNurseId: string; targetNurseName: string;
  situation: string; background: string; assessment: string; recommendation: string; transferredAt: string;
}
