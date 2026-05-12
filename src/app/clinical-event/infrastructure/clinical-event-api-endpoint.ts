import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ClinicalEventResponse } from './clinical-event-response';

@Injectable({ providedIn: 'root' })
export class ClinicalEventApiEndpoint {
    private readonly baseUrl = `${environment.apiBaseUrl}/clinical-events`;
    constructor(private http: HttpClient) {}
    getAll(): Observable<ClinicalEventResponse[]> { return this.http.get<ClinicalEventResponse[]>(this.baseUrl); }
    getByPatientId(id: string): Observable<ClinicalEventResponse[]> { return this.http.get<ClinicalEventResponse[]>(`${this.baseUrl}?patientId=${id}`); }
    register(req: ClinicalEventResponse): Observable<ClinicalEventResponse> { return this.http.post<ClinicalEventResponse>(this.baseUrl, req); }
}
