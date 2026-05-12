/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SbarTransferResponse } from './sbar-transfer-response';

@Injectable({ providedIn: 'root' })
export class SbarApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/sbar-transfers`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<SbarTransferResponse[]> { return this.http.get<SbarTransferResponse[]>(this.baseUrl); }
  getByPatientId(id: string): Observable<SbarTransferResponse[]> { return this.http.get<SbarTransferResponse[]>(`${this.baseUrl}?patientId=${id}`); }
  register(req: SbarTransferResponse): Observable<SbarTransferResponse> { return this.http.post<SbarTransferResponse>(this.baseUrl, req); }
}
