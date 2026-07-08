import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Result } from '../models/api-response.model';
import {
    AuthDto,
    LogInDto,
    RegisterDto,
    InitializeOTPDto,
    ConfirmAuthenticationOTPDto,
    ResetPasswordResponseDto,
    ResetPasswordDto
} from '../models/auth.models';

const USER_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/user-management`;

    private currentUserSignal = signal<AuthDto | null>(null);
    private tokenSignal = signal<string | null>(null);

    currentUser = this.currentUserSignal.asReadonly();
    isLoggedIn = computed(() => !!this.tokenSignal());

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.restoreSession();
    }

    login(dto: LogInDto): Observable<Result<AuthDto>> {
        return this.http.post<Result<AuthDto>>(`${this.apiUrl}/login`, dto).pipe(
            tap(res => {
                if (res.status && res.data) {
                    this.setSession(res.data);
                }
            })
        );
    }

    register(dto: RegisterDto): Observable<Result<AuthDto>> {
        return this.http.post<Result<AuthDto>>(`${this.apiUrl}/register`, dto).pipe(
            tap(res => {
                if (res.status && res.data) {
                    this.setSession(res.data);
                }
            })
        );
    }

    refreshToken(): Observable<Result<AuthDto>> {
        // Reads refresh token from HTTP-only Cookie automatically if withCredentials is true
        return this.http.post<Result<AuthDto>>(`${this.apiUrl}/refresh-token`, {}).pipe(
            tap(res => {
                if (res.status && res.data) {
                    this.setSession(res.data);
                }
            })
        );
    }

    clearRefreshToken(): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/clear-refresh-token`, {}).pipe(
            tap(() => this.logout())
        );
    }

    loginOTP(dto: InitializeOTPDto): Observable<Result<AuthDto>> {
        return this.http.post<Result<AuthDto>>(`${this.apiUrl}/login/otp`, dto);
    }

    confirmLoginOTP(dto: ConfirmAuthenticationOTPDto): Observable<Result<AuthDto>> {
        return this.http.post<Result<AuthDto>>(`${this.apiUrl}/confirm-login/otp`, dto).pipe(
            tap(res => {
                if (res.status && res.data) {
                    this.setSession(res.data);
                }
            })
        );
    }

    resetPasswordOTP(dto: InitializeOTPDto): Observable<Result<ResetPasswordResponseDto>> {
        return this.http.post<Result<ResetPasswordResponseDto>>(`${this.apiUrl}/reset-password/otp`, dto);
    }

    resetPasswordConfirmOTP(dto: ConfirmAuthenticationOTPDto): Observable<Result<string>> {
        return this.http.post<Result<string>>(`${this.apiUrl}/reset-password/confirm-otp`, dto);
    }

    resetPassword(dto: ResetPasswordDto): Observable<Result<boolean>> {
        return this.http.post<Result<boolean>>(`${this.apiUrl}/reset-password`, dto);
    }

    logout(): void {
        this.currentUserSignal.set(null);
        this.tokenSignal.set(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    getToken(): string | null {
        return this.tokenSignal();
    }

    private setSession(authData: AuthDto): void {
        this.currentUserSignal.set(authData);
        this.tokenSignal.set(authData.token);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(USER_KEY, JSON.stringify(authData));
            localStorage.setItem(TOKEN_KEY, authData.token);
        }
    }

    private restoreSession(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
            try {
                this.currentUserSignal.set(JSON.parse(savedUser));
                this.tokenSignal.set(savedToken);
            } catch {
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(TOKEN_KEY);
            }
        }
    }
}

