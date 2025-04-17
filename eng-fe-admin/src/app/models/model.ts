export interface Menu {
    id: number;
    name: string;
    url: string;
    icon: string;
    isSelected: boolean;
    roles: string[];
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}
  
export interface RegisterResponse {
    message: string;
    details?: string[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    createAt: string;
    updatedAt: string;
}
  
export interface CreateUserDto {
    username: string;
    email: string;
    role: string;
}
  
export interface UpdateUserDto {
    username: string;
    email: string;
    role: string;
}
  
  export interface ErrorResponse {
    message: string;
    details: string[];
  }
  
  export interface PaginatedResponse<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
    __typename: string | null;
  }

  export interface JwtPayload {
    sub: string;
    aud: string;
    nbf: number;
    iss: string;
    id: string;
    exp: number;
    iat: number;
    user: string;
    authorities: string[];
  }