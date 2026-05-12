/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject } from '@angular/core';
import { IamStore } from '../../../application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileViewComponent {
  protected iamStore = inject(IamStore);
}
