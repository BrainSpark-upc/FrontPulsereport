/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslatePipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  protected readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  protected signOut(): void {
    this.iamStore.signOut();
    this.router.navigate(['/sign-in']);
  }
}
