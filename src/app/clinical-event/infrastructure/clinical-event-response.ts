export interface ClinicalEventResponse {
  id: string;
  patientId: string;
  patientName: string;
  nurseId: string;
  nurseName: string;
  eventType: string;
  severity: string;
  title: string;
  description: string;
  occurredAt: string;
}
