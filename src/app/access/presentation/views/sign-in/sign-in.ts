import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import {
  ViewMode,
  ViewModeStore,
} from "../../../../shared/application/view-mode.store";
import { LanguageSwitcherComponent } from "../../../../shared/presentation/components/language-switcher/language-switcher";

@Component({
  selector: "app-sign-in",
  standalone: true,
  imports: [TranslatePipe, LanguageSwitcherComponent],
  templateUrl: "./sign-in.html",
  styleUrl: "./sign-in.css",
})
export class SignInComponent {
  private readonly router = inject(Router);
  protected readonly viewModeStore = inject(ViewModeStore);

  protected enterAs(mode: ViewMode): void {
    this.viewModeStore.setMode(mode);
    this.router.navigate(["/dashboard"]);
  }
}
