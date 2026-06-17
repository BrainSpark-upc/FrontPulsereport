/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationStore } from '../../../application/notification.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { PatientStore } from '../../../../patient/application/patient.store';
import { AlertSeverity, AlertStatus, AlertType } from '../../../domain/model/alert.entity';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css',
})
export class AlertListComponent implements OnInit {
  protected store = inject(NotificationStore);
  protected iamStore = inject(IamStore);
  protected patientStore = inject(PatientStore);
  private translate = inject(TranslateService);

  protected readonly AlertStatus = AlertStatus;
  protected readonly AlertSeverity = AlertSeverity;
  protected readonly AlertType = AlertType;

  selectedFilter = signal<'Todas' | 'Críticas' | 'Moderadas'>('Todas');
  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  form = {
    patientId: '',
    type: AlertType.CARDIAC,
    severity: AlertSeverity.CRITICAL,
    description: '',
  };

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.store.loadAlerts();
  }

  openCreateForm(): void {
    this.errorMessage.set(null);
    this.form = {
      patientId: '',
      type: AlertType.CARDIAC,
      severity: AlertSeverity.CRITICAL,
      description: '',
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMessage.set(null);
    this.showForm.set(false);
  }

  saveAlert(): void {
    this.errorMessage.set(null);

    if (!this.form.patientId) {
      this.errorMessage.set(this.translate.instant('alerts.patientRequired'));
      return;
    }

    if (!this.form.description.trim()) {
      this.errorMessage.set(this.translate.instant('alerts.descriptionRequired'));
      return;
    }

    this.store.createManualAlert({
      patientId: this.form.patientId,
      type: this.form.type,
      severity: this.form.severity,
      description: this.form.description.trim(),
    });

    this.cancelForm();
  }

  acknowledge(id: string): void {
    this.store.acknowledge(id);
  }

  resolve(id: string): void {
    this.store.resolve(id);
  }

  activeCount(): number {
    return this.store.alerts().filter(a => a.status !== AlertStatus.CLOSED).length;
  }
}