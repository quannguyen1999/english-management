import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { WebSocketService } from './websocket.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private readonly BASE_URL = `${environment.port}/user-service`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private websocketService: WebSocketService,
    private userService: UserService
  ) {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    this.isAuthenticated.next(!!token);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const params = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password)
      .set('grant_type', 'custom_password')
      .set('client_id', 'testing')
      .set('client_secret', 'password');

    return this.http.post<LoginResponse>(`${this.BASE_URL}/oauth2/token`, null, { params }).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.isAuthenticated.next(true);
        this.router.navigate(['/chat']);
      })
    );
  }

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/register`, userData);
  }

  redirectToChat(): void {
    this.router.navigate(['/chat']);
  }

  logout(): void {
    this.websocketService.publishStatusUser(this.userService.getIdOfUser() || '', false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticated.next(false);
    this.websocketService.disconnect();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
} 