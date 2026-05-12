/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';
import { User, normalizeUserRole } from '../domain/model/user.entity';
import { IamApiEndpoint } from '../infrastructure/iam-api-endpoint';
import { SignUpRequest } from '../infrastructure/sign-up.request';
import { UsersResponse } from '../infrastructure/users-response';

const SESSION_KEY = 'front-pulse-report-session';

interface StoredSession {
  token: string;
  user: UsersResponse;
}

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly api = inject(IamApiEndpoint);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null && this._currentUser() !== null);
  readonly displayName = computed(() => this.currentUser()?.fullName ?? 'Usuario');
  readonly canRegisterVitals = computed(() => this.hasAnyRole(['NURSE', 'HEAD_NURSE', 'ADMIN']));
  readonly canRegisterClinicalEvents = computed(() => this.hasAnyRole(['NURSE', 'HEAD_NURSE', 'DOCTOR', 'ADMIN']));
  readonly canRegisterSbar = computed(() => this.hasAnyRole(['HEAD_NURSE', 'ADMIN']));
  readonly canAcknowledgeAlerts = computed(() => this.hasAnyRole(['HEAD_NURSE', 'DOCTOR', 'ADMIN']));
  readonly canResolveAlerts = computed(() => this.hasAnyRole(['DOCTOR', 'ADMIN']));
  readonly canGenerateReports = computed(() => this.hasAnyRole(['HEAD_NURSE', 'DOCTOR', 'ADMIN']));
  readonly canSeeAudit = computed(() => this.hasAnyRole(['ADMIN', 'HEAD_NURSE']));
  readonly canManageUsers = computed(() => this.hasAnyRole(['ADMIN']));

  constructor() {
    this.restoreSession();
  }

  signIn(username: string, password: string): Observable<boolean> {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    return this.api.getUsers().pipe(
      map(users => {
        const user = users.find(item =>
          item.username.trim().toLowerCase() === cleanUsername &&
          item.password.trim() === cleanPassword,
        );

        if (!user) {
          this.clearSession();
          this._errorMessage.set('Usuario o contraseña incorrectos.');
          return false;
        }

        this.setSession({ ...user, role: normalizeUserRole(user.role) });
        return true;
      }),
      catchError(() => {
        this.clearSession();
        this._errorMessage.set('No se pudo conectar con el servidor. Revisa que el db.json esté corriendo.');
        return of(false);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  signUp(request: SignUpRequest): Observable<boolean> {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    return this.api.findByUsername(request.username).pipe(
      switchMap(usersByName => {
        if (usersByName.length > 0) {
          this._errorMessage.set('Ese nombre de usuario ya existe.');
          return of(false);
        }
        return this.api.findByEmail(request.email).pipe(
          switchMap(usersByEmail => {
            if (usersByEmail.length > 0) {
              this._errorMessage.set('Ese correo ya está registrado.');
              return of(false);
            }
            const newUser = {
              ...request,
              id: crypto.randomUUID(),
              username: request.username.trim(),
              email: request.email.trim().toLowerCase(),
              password: request.password.trim(),
              role: normalizeUserRole(request.role),
            };
            return this.api.create(newUser).pipe(
              map(created => {
                this.setSession(created);
                return true;
              }),
            );
          }),
        );
      }),
      catchError(() => {
        this._errorMessage.set('No se pudo crear la cuenta. Revisa que el servidor esté corriendo.');
        return of(false);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  signOut(): void {
    this.clearSession();
  }

  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.currentUser()?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  private setSession(response: UsersResponse): void {
    const user = this.toUser(response);
    const token = `db-json-token-${response.id}-${Date.now()}`;
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user: response } satisfies StoredSession));
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw) as StoredSession;
      this._token.set(session.token);
      this._currentUser.set(this.toUser(session.user));
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  private toUser(response: UsersResponse): User {
    return new User(
      response.id,
      response.username,
      response.firstName,
      response.lastName,
      response.email,
      normalizeUserRole(response.role),
    );
  }
}
