import { VitalSign, RiskLevel } from '../domain/model/vital-sign.entity';
import { VitalSignResponse } from './vital-sign-response';
import { RecordVitalSignCommand } from '../domain/model/record-vital-sign.command';
import { RecordVitalSignRequest } from './record-vital-sign.request';

export class VitalSignAssembler {
  static toEntity(r: VitalSignResponse): VitalSign {
    return new VitalSign(r.id, r.patientId, r.patientName, r.nurseId, r.heartRate,
      r.respiratoryRate, r.systolic, r.diastolic, r.oxygenSaturation, r.temperature,
      r.riskLevel as RiskLevel, new Date(r.recordedAt));
  }
  static toEntityList(responses: VitalSignResponse[]): VitalSign[] { return responses.map(r => this.toEntity(r)); }
  static toRequest(cmd: RecordVitalSignCommand): RecordVitalSignRequest {
    return { patientId: cmd.patientId, heartRate: cmd.heartRate, respiratoryRate: cmd.respiratoryRate,
      systolic: cmd.systolic, diastolic: cmd.diastolic, oxygenSaturation: cmd.oxygenSaturation,
      temperature: cmd.temperature, notes: cmd.notes };
  }
}
