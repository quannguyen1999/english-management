# Authentication System

This document describes the authentication system implemented in the messaging application.

## Overview

The authentication system uses JWT tokens (access token and refresh token) to manage user sessions. Tokens are stored both in HTTP-only cookies (for server-side middleware) and localStorage (for client-side access).

## Components

### 1. Middleware (`src/middleware.tsx`)

The middleware handles:

- **Locale routing**: Redirects users to localized routes (e.g., `/en/sign-in`)
- **Authentication checks**: Verifies if users are authenticated for protected routes
- **Automatic redirects**:
  - Unauthenticated users → `/sign-in`
  - Authenticated users on auth pages → `/` (home)

### 2. Token Management (`src/utils/auth.ts`)

Utility functions for token management:

- `saveTokens()`: Save tokens to localStorage
- `getAccessToken()`: Retrieve access token
- `getRefreshToken()`: Retrieve refresh token
- `isTokenExpired()`: Check if token is expired
- `isAuthenticated()`: Check if user is authenticated
- `clearTokens()`: Clear all tokens
- `getAuthHeader()`: Get Authorization header for API requests
- `refreshAccessToken()`: Refresh expired access token
- `logout()`: Logout user and clear tokens

### 3. API Routes

#### Authentication Endpoints:

- `POST /api/auth/sign-in`: User login (OAuth2)
- `POST /api/auth/sign-up`: User registration
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: User logout

#### Protected Endpoints:

- `GET /api/users/profile`: Get user profile
- `PUT /api/users/update`: Update user
- `GET /api/users/search`: Search users
- `GET /api/conversations`: Get conversations
- `POST /api/conversations/private`: Create private conversation
- `POST /api/conversations/group`: Create group conversation
- `GET /api/conversations/friend-all`: Get friend conversations
- `GET /api/friends/search`: Search friends
- `GET /api/friends/load-id`: Get conversation ID

### 4. API Client (`src/service/api-auth.ts`)

Enhanced API client with:

- **Automatic authentication headers**: Adds Authorization header for protected routes
- **Token refresh**: Automatically refreshes expired tokens
- **Error handling**: Redirects to login on authentication failures

### 5. Authentication Hook (`src/hooks/use-auth.ts`)

React hook for authentication state management:

- `isAuthenticated`: Current authentication status
- `isLoading`: Loading state
- `user`: User information
- `logout`: Logout function

## Flow

### 1. User Login

1. User submits credentials on `/sign-in`
2. API call to `/api/auth/sign-in` (OAuth2)
3. Tokens saved to:
   - HTTP-only cookies (for middleware)
   - localStorage (for client-side access)
4. User redirected to `/` (home)

### 2. Protected Route Access

1. Middleware checks for tokens in cookies
2. If authenticated → allow access
3. If not authenticated → redirect to `/sign-in`

### 3. API Request with Expired Token

1. API client makes request with expired token
2. Server returns 401 Unauthorized
3. API client automatically calls `/api/auth/refresh`
4. New tokens saved
5. Original request retried with new token

### 4. User Logout

1. User clicks logout
2. API call to `/api/auth/logout`
3. Server clears HTTP-only cookies
4. Client clears localStorage tokens
5. User redirected to `/sign-in`

## Security Features

- **HTTP-only cookies**: Prevents XSS attacks on tokens
- **Secure cookies**: HTTPS-only in production
- **Token expiration**: Automatic token refresh
- **CSRF protection**: SameSite cookie attribute
- **Automatic cleanup**: Tokens cleared on logout/expiration

## Usage Examples

### Using the Authentication Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/sign-in">Sign In</a>
      )}
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { getUserProfile } from "@/service/api-auth";

async function loadProfile() {
  try {
    const response = await getUserProfile();
    // API client automatically handles authentication
    console.log(response.data);
  } catch (error) {
    // Handles 401 and token refresh automatically
    console.error("Failed to load profile:", error);
  }
}
```

## Configuration

Environment variables:

- `BACKEND_API`: Backend API base URL
- `CLIENT_ID`: OAuth2 client ID
- `CLIENT_SECRET`: OAuth2 client secret
- `GRANT_TYPE`: OAuth2 grant type

## Public Routes

The following routes don't require authentication:

- `/sign-in`
- `/sign-up`
- `/oauth2/success`
- `/oauth2/error`
- `/api/auth/sign-in`
- `/api/auth/sign-up`
- `/api/auth/refresh`
