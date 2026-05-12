import { Alert, AlertSeverity, AlertStatus } from '../domain/model/alert.entity';
import { AlertResponse } from './alert-response';

export class AlertAssembler {
  static toEntity(r: AlertResponse): Alert {
    return new Alert(r.id, r.patientId, r.patientName, r.title, r.message,
      r.severity as AlertSeverity, r.status as AlertStatus, new Date(r.triggeredAt));
  }
  static toEntityList(responses: AlertResponse[]): Alert[] { return responses.map(r => this.toEntity(r)); }
}
