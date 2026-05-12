export interface RecordVitalSignRequest {
  patientId: string; heartRate: number; respiratoryRate: number;
  systolic: number; diastolic: number; oxygenSaturation: number;
  temperature: number; notes: string;
}
