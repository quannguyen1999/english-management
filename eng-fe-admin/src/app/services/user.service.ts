import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CreateUserDto, PaginatedResponse, UpdateUserDto, User } from '../models/model';
import { API_USERS, PATH_LOGIN } from '../constants/paths';
import { TranslationService } from './translation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DURATION_SNACKBAR } from '../constants/configs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.userServiceUrl}/` + API_USERS;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private translationService: TranslationService,
    private snackBar: MatSnackBar
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(page: number = 0, size: number = 5, search: string = ''): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('username', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/' + PATH_LOGIN]);
          this.snackBar.open(this.translationService.getTranslation('UNAUTHORIZED'), 'Close', { duration: DURATION_SNACKBAR });
        }
        return throwError(() => error);
      })
    );
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.snackBar.open(this.translationService.getTranslation('USER_CREATED'), 'Close', { duration: DURATION_SNACKBAR });
      }),
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/' + PATH_LOGIN]);
          this.snackBar.open(this.translationService.getTranslation('UNAUTHORIZED'), 'Close', { duration: DURATION_SNACKBAR });
        }
        if (error.error?.details?.includes('USER_NAME_EXISTS')) {
          this.snackBar.open(this.translationService.getTranslation('USERNAME_EXISTS'), 'Close', { duration: DURATION_SNACKBAR });
        }
        return throwError(() => error);
      })
    );
  }

  updateUser(user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(this.apiUrl, user, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.snackBar.open(this.translationService.getTranslation('USER_UPDATED'), 'Close', { duration: DURATION_SNACKBAR });
      }),
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/' + PATH_LOGIN]);
          this.snackBar.open(this.translationService.getTranslation('UNAUTHORIZED'), 'Close', { duration: DURATION_SNACKBAR });
        }
        if (error.error?.details?.includes('USER_INVALID')) {
          this.snackBar.open(this.translationService.getTranslation('INVALID_USER_DATA'), 'Close', { duration: DURATION_SNACKBAR });
        }
        if (error.error?.details?.includes('USER_EMAIL_EXISTS')) {
          this.snackBar.open(this.translationService.getTranslation('EMAIL_EXISTS'), 'Close', { duration: DURATION_SNACKBAR });
        }
        return throwError(() => error);
      })
    );
  }
} 