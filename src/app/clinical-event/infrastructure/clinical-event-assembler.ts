import {
  ClinicalEvent,
  ClinicalEventType,
  ClinicalEventSeverity,
} from "../domain/model/clinical-event.entity";
import { ClinicalEventResponse } from "./clinical-event-response";
import { RegisterClinicalEventCommand } from "../domain/model/register-clinical-event.command";
import { RegisterClinicalEventRequest } from "./register-clinical-event.request";

export class ClinicalEventAssembler {
  static toEntity(r: ClinicalEventResponse): ClinicalEvent {
    return new ClinicalEvent(
      r.id,
      r.patientId,
      r.patientName,
      r.nurseId,
      r.nurseName,
      r.eventType as ClinicalEventType,
      r.severity as ClinicalEventSeverity,
      r.title,
      r.description,
      new Date(r.occurredAt),
    );
  }
  static toEntityList(responses: ClinicalEventResponse[]): ClinicalEvent[] {
    return responses.map((r) => this.toEntity(r));
  }
  static toRequest(
    cmd: RegisterClinicalEventCommand,
  ): RegisterClinicalEventRequest {
    return {
      patientId: cmd.patientId,
      eventType: cmd.eventType,
      severity: cmd.severity,
      title: cmd.title,
      description: cmd.description,
    };
  }
}
