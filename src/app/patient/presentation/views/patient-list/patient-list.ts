/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientStore } from '../../../application/patient.store';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css',
})
export class PatientListComponent implements OnInit {
  protected store = inject(PatientStore);
  private router = inject(Router);

  activeMenu = signal<string | null>(null);
  showForm = signal(false);
  query = signal('');
  errorMessage = signal<string | null>(null);
  form = { firstName: '', lastName: '', documentNumber: '', dateOfBirth: '1980-01-01', gender: 'Masculino', phone: '', email: '', roomNumber: '' };

  ngOnInit(): void { this.store.loadPatients(); }

  filteredPatients() {
    const value = this.query().trim().toLowerCase();
    if (!value) return this.store.patients();
    return this.store.patients().filter(patient =>
      `${patient.code} ${patient.fullName} ${patient.documentNumber} ${patient.roomNumber} ${patient.status}`.toLowerCase().includes(value),
    );
  }

  toggleMenu(patientId: string): void { this.activeMenu.update(v => v === patientId ? null : patientId); }
  closeMenu(): void { this.activeMenu.set(null); }
  goToMonitoring(patientId: string): void { this.closeMenu(); this.router.navigate(['/patients', patientId, 'monitoring']); }
  editPatient(patientId: string): void { this.closeMenu(); this.goToMonitoring(patientId); }
  dischargePatient(patientId: string): void { this.closeMenu(); this.store.dischargePatient(patientId); }

  savePatient(): void {
    this.errorMessage.set(null);
    const documentExists = this.store.patients().some(p => p.documentNumber === this.form.documentNumber.trim());
    if (documentExists) {
      this.errorMessage.set('Ya existe un paciente con ese documento.');
      return;
    }
    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.documentNumber.trim() || !this.form.roomNumber.trim()) {
      this.errorMessage.set('Completa nombres, apellidos, documento y habitación.');
      return;
    }
    this.store.createPatient({
      ...this.form,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      documentNumber: this.form.documentNumber.trim(),
      email: this.form.email.trim().toLowerCase(),
      phone: this.form.phone.trim(),
      roomNumber: this.form.roomNumber.trim(),
      dateOfBirth: new Date(this.form.dateOfBirth).toISOString(),
    });
    this.form = { firstName: '', lastName: '', documentNumber: '', dateOfBirth: '1980-01-01', gender: 'Masculino', phone: '', email: '', roomNumber: '' };
    this.showForm.set(false);
  }
}
