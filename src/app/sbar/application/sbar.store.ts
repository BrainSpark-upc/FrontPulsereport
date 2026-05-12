/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { SbarTransfer } from '../domain/model/sbar-transfer.entity';
import { SbarApiEndpoint } from '../infrastructure/sbar-api-endpoint';
import { SbarAssembler } from '../infrastructure/sbar-assembler';
import { SbarTransferResponse } from '../infrastructure/sbar-transfer-response';
import { PatientStore } from '../../patient/application/patient.store';
import { AuditStore } from '../../audit/application/audit.store';
import { AuditAction } from '../../audit/domain/model/audit-log.entity';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class SbarStore {
  private readonly api = inject(SbarApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);
  private readonly iamStore = inject(IamStore);
  private readonly _transfers = signal<SbarTransfer[]>([]);
  readonly transfers = this._transfers.asReadonly();

  loadTransfers(): void {
    this.api.getAll().subscribe(res => {
      this._transfers.set(SbarAssembler.toEntityList(res).sort((a, b) => b.transferredAt.getTime() - a.transferredAt.getTime()));
    });
  }

  registerTransfer(form: Omit<SbarTransferResponse, 'id' | 'patientName' | 'sourceNurseId' | 'sourceNurseName' | 'targetNurseName' | 'transferredAt'>): void {
    const patient = this.patients.patients().find(p => p.id === form.patientId);
    const currentUser = this.iamStore.currentUser();
    const targetName = form.targetNurseId === 'n-002' ? 'Luis Paredes' : form.targetNurseId === 'd-001' ? 'René Salazar' : 'Claudia Ramos';
    const request: SbarTransferResponse = {
      ...form,
      id: crypto.randomUUID(),
      patientName: patient?.fullName ?? 'Paciente no identificado',
      sourceNurseId: currentUser?.id ?? 'system',
      sourceNurseName: currentUser?.fullName ?? 'Sistema',
      targetNurseName: targetName,
      transferredAt: new Date().toISOString(),
    };

    this.api.register(request).subscribe(created => {
      const transfer = SbarAssembler.toEntity(created);
      this._transfers.update(list => [transfer, ...list]);
      this.audit.register(AuditAction.SBAR_TRANSFER, `Registró traspaso SBAR para ${transfer.patientName}`);
    });
  }
}
