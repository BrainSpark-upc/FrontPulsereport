/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IamStore } from '../../../application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [TranslatePipe, FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignInComponent {
  protected readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  protected form = { username: 'enfermera.ana', password: '123456' };

  protected signIn(): void {
    this.iamStore.signIn(this.form.username, this.form.password).subscribe(ok => {
      if (ok) this.router.navigate(['/dashboard']);
    });
  }
}
