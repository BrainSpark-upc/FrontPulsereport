/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportStore } from '../../../application/report.store';
import { ReportType } from '../../../domain/model/report.entity';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'app-report-list', standalone: true, imports: [TranslatePipe, DatePipe, FormsModule], templateUrl: './report-list.html', styleUrl: './report-list.css' })
export class ReportListComponent implements OnInit {
  protected store = inject(ReportStore);
  protected iamStore = inject(IamStore);
  showForm = signal(false);
  types = Object.values(ReportType);
  form = { type: ReportType.GENERAL, title: '', startDate: '2026-05-01', endDate: '2026-05-11' };

  ngOnInit(): void { this.store.loadReports(); }

  save(): void {
    if (!this.iamStore.canGenerateReports()) return;
    this.store.generateReport({ ...this.form, startDate: new Date(this.form.startDate).toISOString(), endDate: new Date(this.form.endDate).toISOString() });
    this.form = { type: ReportType.GENERAL, title: '', startDate: '2026-05-01', endDate: '2026-05-11' };
    this.showForm.set(false);
  }

  download(reportTitle: string): void { alert(`Reporte preparado: ${reportTitle}. En este prototipo se guarda en db.json como transacción clínica.`); }
}
