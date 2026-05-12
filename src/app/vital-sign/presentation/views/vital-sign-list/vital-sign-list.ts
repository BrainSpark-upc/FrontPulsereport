/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VitalSignStore } from '../../../application/vital-sign.store';
import { PatientStore } from '../../../../patient/application/patient.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'app-vital-sign-list', standalone: true, imports: [TranslatePipe, DatePipe, FormsModule], templateUrl: './vital-sign-list.html', styleUrl: './vital-sign-list.css' })
export class VitalSignListComponent implements OnInit {
  protected store = inject(VitalSignStore);
  protected patientStore = inject(PatientStore);
  showForm = signal(false);
  errorMessage = signal<string | null>(null);
  form = { patientId: '', heartRate: 78, respiratoryRate: 18, systolic: 120, diastolic: 80, oxygenSaturation: 98, temperature: 36.5 };
  ngOnInit(): void { this.patientStore.loadPatients(); this.store.loadVitalSigns(); }

  save(): void {
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;
    this.store.recordVitalSign(this.form);
    this.showForm.set(false);
  }

  private validateForm(): string | null {
    if (!this.form.patientId) return 'Selecciona un paciente para asociar el registro.';
    if (this.form.heartRate < 30 || this.form.heartRate > 220) return 'La FC debe estar entre 30 y 220 bpm.';
    if (this.form.respiratoryRate < 5 || this.form.respiratoryRate > 60) return 'La FR debe estar entre 5 y 60 rpm.';
    if (this.form.systolic < 60 || this.form.systolic > 260) return 'La TA sistólica debe estar entre 60 y 260 mmHg.';
    if (this.form.diastolic < 30 || this.form.diastolic > 160) return 'La TA diastólica debe estar entre 30 y 160 mmHg.';
    if (this.form.systolic <= this.form.diastolic) return 'La TA sistólica debe ser mayor que la diastólica.';
    if (this.form.oxygenSaturation < 50 || this.form.oxygenSaturation > 100) return 'La saturación debe estar entre 50% y 100%.';
    if (this.form.temperature < 32 || this.form.temperature > 43) return 'La temperatura debe estar entre 32 °C y 43 °C.';
    return null;
  }
}
