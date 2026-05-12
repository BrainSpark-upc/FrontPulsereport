/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SbarStore } from '../../../application/sbar.store';
import { PatientStore } from '../../../../patient/application/patient.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'app-sbar-list', standalone: true, imports: [TranslatePipe, DatePipe, FormsModule], templateUrl: './sbar-list.html', styleUrl: './sbar-list.css' })
export class SbarListComponent implements OnInit {
  protected store = inject(SbarStore);
  protected patientStore = inject(PatientStore);
  showForm = signal(false);
  errorMessage = signal<string | null>(null);
  form = { patientId: '', targetNurseId: 'n-002', situation: '', background: '', assessment: '', recommendation: '' };

  ngOnInit(): void { this.patientStore.loadPatients(); this.store.loadTransfers(); }

  save(): void {
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;
    this.store.registerTransfer({
      ...this.form,
      situation: this.form.situation.trim(),
      background: this.form.background.trim(),
      assessment: this.form.assessment.trim(),
      recommendation: this.form.recommendation.trim(),
    });
    this.form = { patientId: '', targetNurseId: 'n-002', situation: '', background: '', assessment: '', recommendation: '' };
    this.showForm.set(false);
  }

  private validateForm(): string | null {
    if (!this.form.patientId) return 'Selecciona el paciente del traspaso.';
    if (this.form.situation.trim().length < 8) return 'Completa la situación actual del paciente.';
    if (this.form.background.trim().length < 8) return 'Completa antecedentes relevantes.';
    if (this.form.assessment.trim().length < 8) return 'Completa la evaluación clínica.';
    if (this.form.recommendation.trim().length < 8) return 'Completa la recomendación para el siguiente turno.';
    return null;
  }
}
