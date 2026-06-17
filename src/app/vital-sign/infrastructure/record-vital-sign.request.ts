/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

export interface RecordVitalSignRequest {
  patientId: number;
  nurseId: number;
  heartRate: number;
  respiratoryRate: number;
  systolicPressure: number;
  diastolicPressure: number;
  oxygenSaturation: number;
  temperature: number;
  recordedAt?: string;
}