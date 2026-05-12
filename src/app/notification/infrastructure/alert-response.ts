/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

export interface AlertResponse {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  triggeredAt: string;
  sourceType?: string;
  sourceId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}
