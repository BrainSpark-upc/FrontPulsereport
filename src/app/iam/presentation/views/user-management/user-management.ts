/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IamApiEndpoint } from '../../../infrastructure/iam-api-endpoint';
import { UsersResponse } from '../../../infrastructure/users-response';
import { USER_ROLE_LABELS, UserRole, normalizeUserRole } from '../../../domain/model/user.entity';
import { IamStore } from '../../../application/iam.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagementComponent implements OnInit {
  private readonly api = inject(IamApiEndpoint);
  protected readonly iamStore = inject(IamStore);

  protected readonly users = signal<UsersResponse[]>([]);
  protected readonly query = signal('');
  protected readonly roleLabels = USER_ROLE_LABELS;
  protected readonly roles = Object.values(UserRole);

  ngOnInit(): void {
    this.loadUsers();
  }

  protected filteredUsers(): UsersResponse[] {
    const value = this.query().trim().toLowerCase();
    if (!value) return this.users();
    return this.users().filter(user =>
      `${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.role}`.toLowerCase().includes(value),
    );
  }

  protected roleLabel(role: string): string {
    return this.roleLabels[normalizeUserRole(role)];
  }

  protected roleCount(role: string): number {
    return this.users().filter(user => normalizeUserRole(user.role) === role).length;
  }

  private loadUsers(): void {
    this.api.getUsers().subscribe(users => this.users.set(users));
  }
}
