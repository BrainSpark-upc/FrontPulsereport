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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: './report-list.html',
  styleUrl: './report-list.css',
})
export class ReportListComponent implements OnInit {
  protected store = inject(ReportStore);
  protected iamStore = inject(IamStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  types = Object.values(ReportType);

  form = this.emptyForm();

  ngOnInit(): void {
    this.store.loadReports();
  }

  openForm(): void {
    this.errorMessage.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  save(): void {
    if (!this.iamStore.canGenerateReports()) return;

    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;

    this.store.generateReport({
      ...this.form,
      startDate: new Date(this.form.startDate).toISOString(),
      endDate: new Date(`${this.form.endDate}T23:59:59`).toISOString(),
    });

    this.form = this.emptyForm();
    this.showForm.set(false);
  }

  download(reportTitle: string): void {
    alert(`${this.translate.instant('reports.prepared')}: ${reportTitle}`);
  }

  private emptyForm() {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);

    return {
      type: ReportType.GENERAL,
      title: '',
      startDate: start.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
    };
  }

  private validateForm(): string | null {
    if (!this.form.title.trim()) return this.translate.instant('reports.validation.titleRequired');
    if (!this.form.startDate || !this.form.endDate) return this.translate.instant('reports.validation.dateRequired');

    const start = new Date(this.form.startDate).getTime();
    const end = new Date(this.form.endDate).getTime();

    if (start > end) return this.translate.instant('reports.validation.invalidRange');

    return null;
  }
}