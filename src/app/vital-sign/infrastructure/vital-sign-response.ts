export interface VitalSignResponse {
  id: string; patientId: string; patientName: string; nurseId: string;
  heartRate: number; respiratoryRate: number; systolic: number; diastolic: number;
  oxygenSaturation: number; temperature: number; riskLevel: string; recordedAt: string;
}
