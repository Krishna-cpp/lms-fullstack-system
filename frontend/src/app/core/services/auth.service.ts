import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, JwtPayload } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = `${environment.apiUrl}/auth`;
    private _user = signal<User | null>(this.loadUser());

    constructor(private http: HttpClient, private router: Router) { }

    register(data: { name: string; email: string; password: string; role: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.api}/register`, data).pipe(
            tap(res => this.storeSession(res))
        );
    }

    login(data: { email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
            tap(res => this.storeSession(res))
        );
    }

    logout(): void {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        this._user.set(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        const token = localStorage.getItem('lms_token');
        if (!token) return false;
        try {
            const payload = this.decodeToken(token);
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    currentUser(): User | null {
        return this._user();
    }

    getToken(): string | null {
        return localStorage.getItem('lms_token');
    }

    decodeToken(token: string): JwtPayload {
        const base64 = token.split('.')[1];
        const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json) as JwtPayload;
    }

    private storeSession(res: AuthResponse): void {
        localStorage.setItem('lms_token', res.token);
        localStorage.setItem('lms_user', JSON.stringify(res.user));
        this._user.set(res.user);
    }

    private loadUser(): User | null {
        const raw = localStorage.getItem('lms_user');
        if (!raw) return null;
        try { return JSON.parse(raw) as User; } catch { return null; }
    }
}
