import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // 1. Clone the request to include the Authorization header and withCredentials
    // withCredentials ensures the browser includes HTTP-only cookies like refresh tokens
    let authReq = req.clone({
        withCredentials: true,
        setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If the error is 401 Unauthorized, we attempt to refresh the token automatically
            if (error.status === 401) {
                return authService.refreshToken().pipe(
                    switchMap((res) => {
                        // If token refresh was successful, re-run the failed request with the new token
                        if (res.status && res.data?.token) {
                            const newAuthReq = req.clone({
                                withCredentials: true,
                                setHeaders: { Authorization: `Bearer ${res.data.token}` }
                            });
                            return next(newAuthReq);
                        }
                        
                        // Otherwise (e.g., refresh token expired), clean out the session and redirect to auth
                        authService.logout();
                        router.navigate(['/auth']);
                        return throwError(() => error);
                    }),
                    catchError((err) => {
                        authService.logout();
                        router.navigate(['/auth']);
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
