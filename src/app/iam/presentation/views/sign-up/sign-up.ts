/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IamStore } from '../../../application/iam.store';
import { USER_ROLE_LABELS, UserRole } from '../../../domain/model/user.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [TranslatePipe, FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUpComponent {
  protected readonly iamStore = inject(IamStore);
  protected readonly roles = Object.values(UserRole);
  protected readonly roleLabels = USER_ROLE_LABELS;
  private readonly router = inject(Router);

  protected form = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.NURSE,
  };

  protected signUp(): void {
    this.iamStore.signUp(this.form).subscribe(ok => {
      if (ok) this.router.navigate(['/dashboard']);
    });
  }
}
