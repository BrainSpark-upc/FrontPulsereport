import { Component, inject } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { SubscriptionStore } from "../../../application/subscription.store";
import { PlanId } from "../../../domain/model/plan.entity";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./subscription-plans.html",
  styleUrl: "./subscription-plans.css",
})
export class SubscriptionPlansComponent {
  protected readonly subscriptionStore = inject(SubscriptionStore);

  protected choosePlan(planId: PlanId): void {
    this.subscriptionStore.selectPlan(planId);
  }
}
