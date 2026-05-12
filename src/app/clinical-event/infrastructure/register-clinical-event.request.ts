export interface RegisterClinicalEventRequest {
    patientId: string; eventType: string; severity: string; title: string; description: string;
}
