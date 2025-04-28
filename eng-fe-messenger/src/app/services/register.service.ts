import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterRequest, RegisterError } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly BASE_URL = `${environment.port}/auth-service`;

  constructor(private http: HttpClient) {}

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/register`, userData);
  }
} 