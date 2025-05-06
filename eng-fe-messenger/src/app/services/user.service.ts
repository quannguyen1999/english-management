import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserProfile, UserUpdateRequest, UserError } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/profile.model';

export interface UserSearchResponse {
  page: number;
  size: number;
  total: number;
  data: User[];
  __typename: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BASE_URL = `${environment.port}/user-service`;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.BASE_URL}/users/current-profile`);
  }

  updateUserProfile(profileData: UserUpdateRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.BASE_URL}/users/me`, profileData);
  }

  updateAvatar(avatar: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return this.http.post<UserProfile>(`${this.BASE_URL}/users/me/avatar`, formData);
  }

  searchUsers(username: string, page: number = 0, size: number = 5): Observable<UserSearchResponse> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = {
      username,
      page: page.toString(),
      size: size.toString()
    };
    
    return this.http.get<UserSearchResponse>(`${this.BASE_URL}/conversations/friend`, { 
      params,
      headers 
    });
  }

  getCurrentUsername(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.user;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getIdOfUser(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
} 