/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VitalSignResponse } from './vital-sign-response';

@Injectable({ providedIn: 'root' })
export class VitalSignApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/vital-signs`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<VitalSignResponse[]> { return this.http.get<VitalSignResponse[]>(this.baseUrl); }
  getByPatientId(patientId: string): Observable<VitalSignResponse[]> { return this.http.get<VitalSignResponse[]>(`${this.baseUrl}?patientId=${patientId}`); }
  record(request: VitalSignResponse): Observable<VitalSignResponse> { return this.http.post<VitalSignResponse>(this.baseUrl, request); }
}
