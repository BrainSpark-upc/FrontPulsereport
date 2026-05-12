/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IamStore } from '../application/iam.store';

@Injectable({ providedIn: 'root' })
export class IamGuard implements CanActivate {
  constructor(private iamStore: IamStore, private router: Router) {}

  canActivate(): boolean {
    if (this.iamStore.isAuthenticated()) return true;
    this.router.navigate(['/sign-in']);
    return false;
  }
}
