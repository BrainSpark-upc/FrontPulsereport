/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertResponse } from './alert-response';

@Injectable({ providedIn: 'root' })
export class NotificationApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AlertResponse[]> {
    return this.http.get<AlertResponse[]>(this.baseUrl);
  }

  getActive(): Observable<AlertResponse[]> {
    return this.http.get<AlertResponse[]>(`${this.baseUrl}?status=Activa`);
  }

  create(request: AlertResponse): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(this.baseUrl, request);
  }

  acknowledge(id: string, userName: string): Observable<AlertResponse> {
    return this.http.patch<AlertResponse>(`${this.baseUrl}/${id}`, {
      status: 'Reconocida',
      acknowledgedBy: userName,
      acknowledgedAt: new Date().toISOString(),
    });
  }

  resolve(id: string, userName: string, note = 'Alerta resuelta desde seguimiento clínico.'): Observable<AlertResponse> {
    return this.http.patch<AlertResponse>(`${this.baseUrl}/${id}`, {
      status: 'Resuelta',
      resolvedBy: userName,
      resolvedAt: new Date().toISOString(),
      resolutionNote: note,
    });
  }
}
