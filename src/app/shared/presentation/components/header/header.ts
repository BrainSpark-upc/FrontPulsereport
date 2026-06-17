import { Component, Input, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { NotificationStore } from "../../../../notification/application/notification.store";
import { AlertStatus } from "../../../../notification/domain/model/alert.entity";
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher";
import { ViewMode, ViewModeStore } from "../../../application/view-mode.store";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [LanguageSwitcherComponent, TranslatePipe, DatePipe],
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class HeaderComponent {
  @Input() pageTitle = "";

  protected notificationStore = inject(NotificationStore);
  protected viewModeStore = inject(ViewModeStore);
  private router = inject(Router);

  notificationsOpen = signal(false);
  helpOpen = signal(false);
  modeOpen = signal(false);

  protected activeAlerts = computed(() =>
    this.notificationStore
      .alerts()
      .filter((alert) => alert.status !== AlertStatus.RESOLVED),
  );

  protected latestAlerts = computed(() => this.activeAlerts().slice(0, 5));
  protected modeTitleKey = computed(() => {
    if (this.viewModeStore.isAdmin()) return "access.adminTitle";
    if (this.viewModeStore.isDoctor()) return "access.doctorTitle";
    return "access.nurseTitle";
  });
  protected modeInitials = computed(() => {
    if (this.viewModeStore.isAdmin()) return "AD";
    if (this.viewModeStore.isDoctor()) return "MD";
    return "EN";
  });

  constructor() {
    this.notificationStore.loadAlerts();
  }

  toggleNotifications(): void {
    this.helpOpen.set(false);
    this.modeOpen.set(false);
    this.notificationsOpen.update((value) => !value);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  toggleHelp(): void {
    this.notificationsOpen.set(false);
    this.modeOpen.set(false);
    this.helpOpen.update((value) => !value);
  }

  closeHelp(): void {
    this.helpOpen.set(false);
  }

  toggleModeMenu(): void {
    this.notificationsOpen.set(false);
    this.helpOpen.set(false);
    this.modeOpen.update((value) => !value);
  }

  closeModeMenu(): void {
    this.modeOpen.set(false);
  }

  selectMode(mode: ViewMode): void {
    this.viewModeStore.setMode(mode);
    this.closeModeMenu();
    this.router.navigate(["/dashboard"]);
  }

  goTo(path: string): void {
    this.closeNotifications();
    this.closeHelp();
    this.closeModeMenu();
    this.router.navigate([path]);
  }

  returnToAccess(): void {
    this.viewModeStore.clearMode();
    this.closeModeMenu();
    this.router.navigate(["/sign-in"]);
  }

  acknowledgeAlert(alertId: string): void {
    this.notificationStore.acknowledge(alertId);
  }

  resolveAlert(alertId: string): void {
    this.notificationStore.resolve(alertId);
  }
}
