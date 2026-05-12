/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogResponse } from './audit-log-response';

@Injectable({ providedIn: 'root' })
export class AuditApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/audit-logs`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<AuditLogResponse[]> { return this.http.get<AuditLogResponse[]>(this.baseUrl); }
  getRecent(limit: number): Observable<AuditLogResponse[]> { return this.http.get<AuditLogResponse[]>(`${this.baseUrl}?_limit=${limit}&_sort=performedAt&_order=desc`); }
  create(request: AuditLogResponse): Observable<AuditLogResponse> { return this.http.post<AuditLogResponse>(this.baseUrl, request); }
}
