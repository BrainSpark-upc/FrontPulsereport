/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientResponse } from './patient-response';

@Injectable({ providedIn: 'root' })
export class PatientApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/patients`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<PatientResponse[]> { return this.http.get<PatientResponse[]>(this.baseUrl); }
  getById(id: string): Observable<PatientResponse> { return this.http.get<PatientResponse>(`${this.baseUrl}/${id}`); }
  create(request: PatientResponse): Observable<PatientResponse> { return this.http.post<PatientResponse>(this.baseUrl, request); }
  update(id: string, request: Partial<PatientResponse>): Observable<PatientResponse> { return this.http.patch<PatientResponse>(`${this.baseUrl}/${id}`, request); }
}
