/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignInRequest } from './sign-in.request';
import { SignUpRequest } from './sign-up.request';
import { UsersResponse } from './users-response';

/**
 * API adapter for IAM using json-server resources.
 *
 * @remarks
 * json-server does not understand custom routes such as /iam/sign-in by default,
 * so authentication is simulated by querying the users collection in db.json.
 */
@Injectable({ providedIn: 'root' })
export class IamApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  findByCredentials(request: SignInRequest): Observable<UsersResponse[]> {
    const params = new HttpParams()
      .set('username', request.username.trim())
      .set('password', request.password);
    return this.http.get<UsersResponse[]>(this.baseUrl, { params });
  }

  findByUsername(username: string): Observable<UsersResponse[]> {
    const params = new HttpParams().set('username', username.trim());
    return this.http.get<UsersResponse[]>(this.baseUrl, { params });
  }

  findByEmail(email: string): Observable<UsersResponse[]> {
    const params = new HttpParams().set('email', email.trim());
    return this.http.get<UsersResponse[]>(this.baseUrl, { params });
  }

  create(request: SignUpRequest & { id: string }): Observable<UsersResponse> {
    return this.http.post<UsersResponse>(this.baseUrl, request);
  }

  getUsers(): Observable<UsersResponse[]> {
    return this.http.get<UsersResponse[]>(this.baseUrl);
  }
}
