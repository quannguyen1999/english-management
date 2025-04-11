import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRoleService } from './user-role.service';
import { LoginResponse, RegisterResponse } from '../models/model';
import { API_CONFIG, DURATION_SNACKBAR } from '../constants/configs';
import { TranslationService } from './translation.service';
import { API_REGISTER, PATH_LOGIN } from '../constants/paths';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.userServiceUrl}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private userRoleService: UserRoleService,
    private translationService: TranslationService
  ) {}

  register(username: string, email: string, password: string): Observable<RegisterResponse> {  
    return this.http.post<RegisterResponse>(`${this.apiUrl}/` + API_REGISTER, {
      username,
      email,
      password
    },).pipe(
      tap(() => {
        this.snackBar.open(this.translationService.getTranslation('REGISTRATION_SUCCESSFUL'), 'Close', { duration: DURATION_SNACKBAR });
        this.router.navigate(['/' + PATH_LOGIN]);
      }),
      catchError(error => {
        const errorDetail = error.error?.details?.[0];
        switch (errorDetail) {
          case 'USER_INVALID':
            this.snackBar.open(this.translationService.getTranslation('INVALID_USER_DATA'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          case 'USER_NAME_INVALID':
            this.snackBar.open(this.translationService.getTranslation('INVALID_USERNAME_FORMAT'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          case 'USER_NAME_EXISTS':
            this.snackBar.open(this.translationService.getTranslation('USERNAME_EXISTS'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          case 'USER_PASSWORD_INVALID':
            this.snackBar.open(this.translationService.getTranslation('INVALID_PASSWORD_FORMAT'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          case 'USER_EMAIL_INVALID':
            this.snackBar.open(this.translationService.getTranslation('INVALID_EMAIL_FORMAT'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          case 'USER_EMAIL_EXISTS':
            this.snackBar.open(this.translationService.getTranslation('EMAIL_EXISTS'), 'Close', { duration: DURATION_SNACKBAR });
            break;
          default:
            this.snackBar.open(this.translationService.getTranslation('REGISTRATION_FAILED'), 'Close', { duration: DURATION_SNACKBAR });
        }
        return throwError(() => error);
      })
    );
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', API_CONFIG.auth.grantType)
      .set('client_id', API_CONFIG.auth.clientId)
      .set('client_secret', API_CONFIG.auth.clientSecret);
    
    return this.http.post<LoginResponse>(API_CONFIG.auth.tokenUrl, null, { params }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.userRoleService.reloadRoles();
        this.snackBar.open(this.translationService.getTranslation('LOGIN_SUCCESSFUL'), 'Close', { duration: DURATION_SNACKBAR });
        this.router.navigate(['/home']);
      }),
      catchError(error => {
        if (error.error?.error === 'access_denied') {
          this.snackBar.open(this.translationService.getTranslation('WRONG_CREDENTIALS'), 'Close', { duration: DURATION_SNACKBAR });
        } else {
          this.snackBar.open(this.translationService.getTranslation('ERROR_OCCURRED'), 'Close', { duration: DURATION_SNACKBAR });
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Clear local storage
    localStorage.clear();
    
    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }

    // Navigate to login page
    this.router.navigate(['/' + PATH_LOGIN]);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
} 