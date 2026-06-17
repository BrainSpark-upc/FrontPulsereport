import { Routes } from "@angular/router";
import { MainLayoutComponent } from "./shared/presentation/layouts/main-layout/main-layout";
import { DashboardViewComponent } from "./dashboard/presentation/views/dashboard-view/dashboard-view";
import { PatientListComponent } from "./patient/presentation/views/patient-list/patient-list";
import { PatientMonitoringComponent } from "./patient/presentation/views/patient-monitoring/patient-monitoring";
import { VitalSignListComponent } from "./vital-sign/presentation/views/vital-sign-list/vital-sign-list";
import { ClinicalEventListComponent } from "./clinical-event/presentation/views/clinical-event-list/clinical-event-list";
import { SbarListComponent } from "./sbar/presentation/views/sbar-list/sbar-list";
import { AlertListComponent } from "./notification/presentation/views/alert-list/alert-list";
import { ReportListComponent } from "./report/presentation/views/report-list/report-list";
import { AuditLogListComponent } from "./audit/presentation/views/audit-log-list/audit-log-list";
import { SignInComponent } from "./access/presentation/views/sign-in/sign-in";

export const routes: Routes = [
  { path: "", redirectTo: "sign-in", pathMatch: "full" },
  {
    path: "sign-in",
    component: SignInComponent,
    data: { titleKey: "access.title" },
  },
  {
    path: "",
    component: MainLayoutComponent,
    children: [
      {
        path: "dashboard",
        component: DashboardViewComponent,
        data: { titleKey: "common.dashboard" },
      },
      {
        path: "patients",
        component: PatientListComponent,
        data: { titleKey: "common.patients" },
      },
      {
        path: "patients/:id/monitoring",
        component: PatientMonitoringComponent,
        data: { titleKey: "patients.detailEyebrow" },
      },
      {
        path: "vital-signs",
        component: VitalSignListComponent,
        data: { titleKey: "common.vitalSigns" },
      },
      {
        path: "clinical-events",
        component: ClinicalEventListComponent,
        data: { titleKey: "common.clinicalEvents" },
      },
      {
        path: "sbar",
        component: SbarListComponent,
        data: { titleKey: "common.sbar" },
      },
      {
        path: "alerts",
        component: AlertListComponent,
        data: { titleKey: "common.alerts" },
      },
      {
        path: "reports",
        component: ReportListComponent,
        data: { titleKey: "common.reports" },
      },
      {
        path: "audit",
        component: AuditLogListComponent,
        data: { titleKey: "common.audit" },
      },
    ],
  },
  { path: "**", redirectTo: "sign-in" },
];
