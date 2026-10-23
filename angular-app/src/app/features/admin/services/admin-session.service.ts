import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type AdminRole = 'Administrador' | 'Gestor';
interface LoginResponse {
  accessToken: string;
  user: { role: 'ADMINISTRADOR' | 'GESTOR' };
}
const TOKEN_KEY = 'golliga.access-token';
interface CurrentUser { role: 'ADMINISTRADOR' | 'GESTOR'; }

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly http = inject(HttpClient);
  private readonly currentRole = new BehaviorSubject<AdminRole | null>(null);
  private restoreRequest: Observable<boolean> | null = null;
  readonly role$ = this.currentRole.asObservable();
  readonly authenticated$ = this.role$.pipe(map(Boolean));
  get isAuthenticated(): boolean { return this.currentRole.value !== null; }
  get role(): AdminRole | null { return this.currentRole.value; }

  restore(): Observable<boolean> {
    if (this.isAuthenticated) return of(true);
    if (this.restoreRequest) return this.restoreRequest;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) return of(false);
    this.restoreRequest = this.http.get<CurrentUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => this.currentRole.next(user.role === 'ADMINISTRADOR' ? 'Administrador' : 'Gestor')),
      map(() => true),
      catchError(() => { this.signOut(); return of(false); }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.restoreRequest;
  }

  signIn(email: string, password: string): Observable<AdminRole | null> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => localStorage.setItem(TOKEN_KEY, response.accessToken)),
      map(response => response.user.role === 'ADMINISTRADOR' ? 'Administrador' as const : 'Gestor' as const),
      tap(role => {
        this.currentRole.next(role);
        this.restoreRequest = null;
      }),
      catchError(() => of(null))
    );
  }

  signOut(): void {
    this.currentRole.next(null);
    this.restoreRequest = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
