import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '../../../application/dashboard.store';
import { PatientStore } from '@patient/application/patient.store';
import { PatientStatusEnum } from '@patient/domain/model/patient.entity';
import { VitalSignStore } from '@vital-sign/application/vital-sign.store';
import { NotificationStore } from '@notification/application/notification.store';
import { AuditStore } from '@audit/application/audit.store';
import { AlertSeverity, AlertStatus } from '@notification/domain/model/alert.entity';
import { ClinicalEventStore } from '@clinical-event/application/clinical-event.store';
import { SbarStore } from '@sbar/application/sbar.store';
import { IamStore } from '@iam/application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [TranslatePipe, DatePipe, SlicePipe, UpperCasePipe, RouterLink],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.css'
})
export class DashboardViewComponent implements OnInit {
  protected dashboardStore = inject(DashboardStore);
  protected patientStore = inject(PatientStore);
  protected vitalSignStore = inject(VitalSignStore);
  protected notificationStore = inject(NotificationStore);
  protected auditStore = inject(AuditStore);
  protected clinicalEventStore = inject(ClinicalEventStore);
  protected sbarStore = inject(SbarStore);
  protected iamStore = inject(IamStore);

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.vitalSignStore.loadVitalSigns();
    this.notificationStore.loadAlerts();
    this.auditStore.loadLogs();
    this.clinicalEventStore.loadEvents();
    this.sbarStore.loadTransfers();
  }

  protected activeAlertsCount(): number {
    return this.notificationStore.alerts().filter(a => a.status === AlertStatus.ACTIVE).length;
  }

  protected criticalAlertsCount(): number {
    return this.notificationStore.alerts().filter(a => a.severity === AlertSeverity.CRITICAL && a.status === AlertStatus.ACTIVE).length;
  }

  protected moderateAlertsCount(): number {
    return this.notificationStore.alerts().filter(a => a.severity === AlertSeverity.MODERATE && a.status === AlertStatus.ACTIVE).length;
  }

  protected lastUpdate(): Date {
    return this.vitalSignStore.vitalSigns()[0]?.recordedAt ?? new Date();
  }

  protected todayEventsCount(): number {
    return this.clinicalEventStore.events().length;
  }

  protected activePatientsCount(): number {
    return this.patientStore.patients().filter(p => p.status !== PatientStatusEnum.DISCHARGED).length;
  }

  protected pendingSbarCount(): number {
    return this.sbarStore.transfers().length;
  }

  protected latestVitals() {
    return this.vitalSignStore.vitalSigns().slice(0, 5);
  }

  protected latestAlerts() {
    return this.notificationStore.alerts().filter(a => a.status !== AlertStatus.RESOLVED).slice(0, 5);
  }

  protected latestAudits() {
    return this.auditStore.logs().slice(0, 5);
  }
}