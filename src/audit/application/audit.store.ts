/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, inject, signal } from '@angular/core';
import { AuditLog, AuditAction } from '../domain/model/audit-log.entity';
import { AuditApiEndpoint } from '../infrastructure/audit-api-endpoint';
import { AuditAssembler } from '../infrastructure/audit-assembler';
import { AuditLogResponse } from '../infrastructure/audit-log-response';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private readonly api = inject(AuditApiEndpoint);
  private readonly iamStore = inject(IamStore);
  private readonly _logs = signal<AuditLog[]>([]);
  readonly logs = this._logs.asReadonly();

  loadLogs(): void {
    this.api.getAll().subscribe(res => {
      this._logs.set(AuditAssembler.toEntityList(res).sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime()));
    });
  }

  register(action: AuditAction, description: string): void {
    const now = new Date();
    const currentUser = this.iamStore.currentUser();
    const request: AuditLogResponse = {
      id: crypto.randomUUID(),
      code: `US-${Math.floor(Math.random() * 90 + 10)}`,
      userId: currentUser?.id ?? 'system',
      username: currentUser?.fullName ?? 'Sistema',
      action,
      description,
      performedAt: now.toISOString(),
    };

    this.api.create(request).subscribe(log => {
      this._logs.update(list => [AuditAssembler.toEntity(log), ...list]);
    });
  }
}
