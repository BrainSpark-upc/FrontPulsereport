/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { VitalSign, RiskLevel } from '../domain/model/vital-sign.entity';
import { VitalSignApiEndpoint } from '../infrastructure/vital-sign-api-endpoint';
import { VitalSignAssembler } from '../infrastructure/vital-sign-assembler';
import { VitalSignResponse } from '../infrastructure/vital-sign-response';
import { PatientStore } from '../../patient/application/patient.store';
import { AuditStore } from '../../audit/application/audit.store';
import { AuditAction } from '../../audit/domain/model/audit-log.entity';
import { IamStore } from '../../iam/application/iam.store';
import { NotificationStore } from '../../notification/application/notification.store';
import { AlertSeverity } from '../../notification/domain/model/alert.entity';

@Injectable({ providedIn: 'root' })
export class VitalSignStore {
  private readonly api = inject(VitalSignApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);
  private readonly iamStore = inject(IamStore);
  private readonly notifications = inject(NotificationStore);
  private readonly _vitalSigns = signal<VitalSign[]>([]);
  readonly vitalSigns = this._vitalSigns.asReadonly();

  loadVitalSigns(): void {
    this.api.getAll().subscribe(res => {
      this._vitalSigns.set(VitalSignAssembler.toEntityList(res).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()));
    });
  }

  recordVitalSign(form: Omit<VitalSignResponse, 'id' | 'patientName' | 'nurseId' | 'riskLevel' | 'recordedAt'>): void {
    const patient = this.patients.patients().find(p => p.id === form.patientId);
    const currentUser = this.iamStore.currentUser();
    const riskLevel = this.calculateRisk(form.heartRate, form.respiratoryRate, form.systolic, form.diastolic, form.oxygenSaturation, form.temperature);
    const request: VitalSignResponse = {
      ...form,
      id: crypto.randomUUID(),
      patientName: patient?.fullName ?? 'Paciente no identificado',
      nurseId: currentUser?.id ?? 'system',
      riskLevel,
      recordedAt: new Date().toISOString(),
    };

    this.api.record(request).subscribe(created => {
      const sign = VitalSignAssembler.toEntity(created);
      this._vitalSigns.update(list => [sign, ...list]);
      this.audit.register(AuditAction.VITAL_SIGN_RECORDED, `Registró signos vitales de ${sign.patientName} con riesgo ${sign.riskLevel}`);
      this.audit.register(AuditAction.BUSINESS_TRANSACTION_EXECUTED, `Transacción: signos vitales → evaluación de riesgo → alertas → auditoría para ${sign.patientName}`);
      this.createAlertsWhenNeeded(sign);
    });
  }

  private createAlertsWhenNeeded(sign: VitalSign): void {
    if (sign.riskLevel !== RiskLevel.CRITICAL && sign.riskLevel !== RiskLevel.HIGH) return;

    const severity = sign.riskLevel === RiskLevel.CRITICAL ? AlertSeverity.CRITICAL : AlertSeverity.MODERATE;
    const messages = this.getClinicalFindings(sign);

    this.notifications.createClinicalAlert({
      patientId: sign.patientId,
      patientName: sign.patientName,
      title: sign.riskLevel === RiskLevel.CRITICAL ? 'Signos vitales críticos' : 'Signos vitales fuera de rango',
      message: messages.join(' | '),
      severity,
      sourceType: 'VITAL_SIGN',
      sourceId: sign.id,
    });
  }

  private getClinicalFindings(sign: VitalSign): string[] {
    const findings: string[] = [];
    if (sign.oxygenSaturation < 90) findings.push(`SatO₂ crítica: ${sign.oxygenSaturation}%`);
    else if (sign.oxygenSaturation < 94) findings.push(`SatO₂ baja: ${sign.oxygenSaturation}%`);

    if (sign.systolic >= 160 || sign.diastolic >= 100) findings.push(`Presión arterial crítica: ${sign.systolic}/${sign.diastolic} mmHg`);
    else if (sign.systolic >= 145 || sign.diastolic >= 95) findings.push(`Presión arterial elevada: ${sign.systolic}/${sign.diastolic} mmHg`);

    if (sign.heartRate >= 130) findings.push(`Frecuencia cardiaca crítica: ${sign.heartRate} bpm`);
    else if (sign.heartRate >= 110) findings.push(`Frecuencia cardiaca alta: ${sign.heartRate} bpm`);

    if (sign.respiratoryRate >= 24) findings.push(`Frecuencia respiratoria alta: ${sign.respiratoryRate} rpm`);
    if (sign.temperature >= 39) findings.push(`Fiebre crítica: ${sign.temperature} °C`);
    else if (sign.temperature >= 38) findings.push(`Fiebre: ${sign.temperature} °C`);

    return findings.length ? findings : [`Riesgo ${sign.riskLevel} detectado en monitoreo clínico.`];
  }

  private calculateRisk(hr: number, rr: number, sys: number, dia: number, spo2: number, temp: number): RiskLevel {
    if (spo2 < 90 || sys >= 160 || dia >= 100 || hr >= 130 || temp >= 39) return RiskLevel.CRITICAL;
    if (spo2 < 94 || sys >= 145 || dia >= 95 || hr >= 110 || rr >= 24 || temp >= 38) return RiskLevel.HIGH;
    if (spo2 < 96 || sys >= 130 || dia >= 85 || hr >= 95 || rr >= 20 || temp >= 37.5) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }
}
