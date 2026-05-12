/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationStore } from '../../../application/notification.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'app-alert-list', standalone: true, imports: [TranslatePipe, DatePipe], templateUrl: './alert-list.html', styleUrl: './alert-list.css' })
export class AlertListComponent implements OnInit {
  protected store = inject(NotificationStore);
  protected iamStore = inject(IamStore);
  selectedFilter = signal<'Todas' | 'Críticas' | 'Moderadas'>('Todas');

  ngOnInit(): void { this.store.loadAlerts(); }
  acknowledge(id: string): void { this.store.acknowledge(id); }
  resolve(id: string): void { this.store.resolve(id); }

  activeCount(): number { return this.store.alerts().filter(a => a.status !== 'Resuelta').length; }
}
