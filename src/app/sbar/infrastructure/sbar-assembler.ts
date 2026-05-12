import { SbarTransfer } from '../domain/model/sbar-transfer.entity';
import { SbarTransferResponse } from './sbar-transfer-response';
import { RegisterSbarCommand } from '../domain/model/register-sbar.command';
import { RegisterSbarRequest } from './register-sbar.request';

export class SbarAssembler {
  static toEntity(r: SbarTransferResponse): SbarTransfer {
    return new SbarTransfer(r.id, r.patientId, r.patientName, r.sourceNurseId, r.sourceNurseName,
      r.targetNurseId, r.targetNurseName, r.situation, r.background, r.assessment, r.recommendation, new Date(r.transferredAt));
  }
  static toEntityList(responses: SbarTransferResponse[]): SbarTransfer[] { return responses.map(r => this.toEntity(r)); }
  static toRequest(cmd: RegisterSbarCommand): RegisterSbarRequest {
    return { patientId: cmd.patientId, targetNurseId: cmd.targetNurseId, situation: cmd.situation,
      background: cmd.background, assessment: cmd.assessment, recommendation: cmd.recommendation };
  }
}
