import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ROLE_ADMIN, ROLE_USER } from '../constants/roles';
import { JwtPayload } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private roles: string[] = [];

  constructor() {
    this.loadRolesFromToken();
  }

  private loadRolesFromToken(): void {
    const token = localStorage.getItem('access_token');
    console.log('Token from localStorage:', token);
    
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        console.log('Decoded token:', decoded);
        this.roles = decoded.authorities || [];
        console.log('Extracted roles:', this.roles);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.roles = [];
      }
    } else {
      console.log('No token found in localStorage');
    }
  }

  hasRole(role: string): boolean {
    const hasRole = this.roles.includes(role);
    console.log(`Checking role ${role}:`, hasRole);
    return hasRole;
  }

  hasAnyRole(roles: string[]): boolean {
    const hasAnyRole = roles.some(role => this.roles.includes(role));
    console.log(`Checking roles ${roles.join(', ')}:`, hasAnyRole);
    return hasAnyRole;
  }

  isAdmin(): boolean {
    return this.hasRole(ROLE_ADMIN);
  }

  isUser(): boolean {
    return this.hasRole(ROLE_USER);
  }

  getRoles(): string[] {
    return [...this.roles];
  }

  reloadRoles(): void {
    this.loadRolesFromToken();
  }
} 