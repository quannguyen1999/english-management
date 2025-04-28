export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface RegisterError {
  message: string;
  details: string[];
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  authorities: string[];
} 