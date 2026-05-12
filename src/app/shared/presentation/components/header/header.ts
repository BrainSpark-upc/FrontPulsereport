/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, Input, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationStore } from '../../../../notification/application/notification.store';
import { AlertStatus } from '../../../../notification/domain/model/alert.entity';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LanguageSwitcherComponent, TranslatePipe, DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  @Input() pageTitle = '';

  protected iamStore = inject(IamStore);
  protected notificationStore = inject(NotificationStore);
  private router = inject(Router);

  dropdownOpen = signal(false);
  notificationsOpen = signal(false);
  helpOpen = signal(false);

  protected activeAlerts = computed(() =>
    this.notificationStore.alerts().filter(alert => alert.status !== AlertStatus.RESOLVED),
  );

  protected latestAlerts = computed(() => this.activeAlerts().slice(0, 5));

  constructor() {
    this.notificationStore.loadAlerts();
  }

  toggleDropdown(): void {
    this.notificationsOpen.set(false);
    this.helpOpen.set(false);
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleNotifications(): void {
    this.dropdownOpen.set(false);
    this.helpOpen.set(false);
    this.notificationsOpen.update(value => !value);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  toggleHelp(): void {
    this.dropdownOpen.set(false);
    this.notificationsOpen.set(false);
    this.helpOpen.update(value => !value);
  }

  closeHelp(): void {
    this.helpOpen.set(false);
  }

  goTo(path: string): void {
    this.closeDropdown();
    this.closeNotifications();
    this.closeHelp();
    this.router.navigate([path]);
  }

  acknowledgeAlert(alertId: string): void {
    this.notificationStore.acknowledge(alertId);
  }

  resolveAlert(alertId: string): void {
    this.notificationStore.resolve(alertId);
  }

  goToProfile(): void {
    this.goTo('/profile');
  }

  signOut(): void {
    this.closeDropdown();
    this.iamStore.signOut();
    this.router.navigate(['/sign-in']);
  }
}
