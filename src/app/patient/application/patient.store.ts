/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { Patient, PatientStatusEnum } from '../domain/model/patient.entity';
import { PatientApiEndpoint } from '../infrastructure/patient-api-endpoint';
import { PatientAssembler } from '../infrastructure/patient-assembler';
import { PatientResponse } from '../infrastructure/patient-response';
import { AuditStore } from '../../audit/application/audit.store';
import { AuditAction } from '../../audit/domain/model/audit-log.entity';

@Injectable({ providedIn: 'root' })
export class PatientStore {
  private readonly api = inject(PatientApiEndpoint);
  private readonly audit = inject(AuditStore);
  private _patients = signal<Patient[]>([]);
  readonly patients = this._patients.asReadonly();

  loadPatients(): void {
    this.api.getAll().subscribe(res => this._patients.set(PatientAssembler.toEntityList(res)));
  }

  createPatient(form: Omit<PatientResponse, 'id' | 'code' | 'status'>): void {
    const total = this._patients().length + 1;
    const request: PatientResponse = {
      ...form,
      id: crypto.randomUUID(),
      code: `P${String(total).padStart(3, '0')}`,
      status: PatientStatusEnum.STABLE,
    };
    this.api.create(request).subscribe(created => {
      const patient = PatientAssembler.toEntity(created);
      this._patients.update(list => [...list, patient]);
      this.audit.register(AuditAction.PATIENT_CREATED, `Registró al paciente ${patient.fullName}`);
    });
  }

  dischargePatient(patientId: string): void {
    this.api.update(patientId, { status: PatientStatusEnum.DISCHARGED }).subscribe(updated => {
      const patient = PatientAssembler.toEntity(updated);
      this._patients.update(list => list.map(p => p.id === patient.id ? patient : p));
      this.audit.register(AuditAction.PATIENT_CREATED, `Actualizó estado de ${patient.fullName} a Alta`);
    });
  }
}
