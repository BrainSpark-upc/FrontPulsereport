import { Injectable, computed, signal } from "@angular/core";

export type ViewMode = "admin" | "user";

const VIEW_MODE_KEY = "pulse-report-view-mode";

@Injectable({ providedIn: "root" })
export class ViewModeStore {
  private readonly selectedMode = signal<ViewMode>(this.readMode());

  readonly mode = this.selectedMode.asReadonly();
  readonly isAdmin = computed(() => this.selectedMode() === "admin");
  readonly isUser = computed(() => this.selectedMode() === "user");

  setMode(mode: ViewMode): void {
    this.selectedMode.set(mode);
    this.saveMode(mode);
  }

  switchMode(): void {
    this.setMode(this.isAdmin() ? "user" : "admin");
  }

  clearMode(): void {
    this.selectedMode.set("user");
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(VIEW_MODE_KEY);
    }
  }

  private readMode(): ViewMode {
    if (typeof localStorage === "undefined") {
      return "user";
    }

    const storedMode = localStorage.getItem(VIEW_MODE_KEY);
    return storedMode === "admin" || storedMode === "user"
      ? storedMode
      : "user";
  }

  private saveMode(mode: ViewMode): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    }
  }
}
