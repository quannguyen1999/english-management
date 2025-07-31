# OAuth2 Flow Implementation

This document describes the Google OAuth2 authentication flow implementation.

## Flow Overview

1. **User clicks "Login with Google"** on the frontend
2. **Frontend redirects to**: `http://localhost:8070/oauth2/authorization/google`
3. **User authenticates with Google** and is redirected back to the backend
4. **Backend processes the OAuth2 callback** and generates a JWT token
5. **Backend redirects to frontend**: `http://localhost:3000/oauth2/success?token=xxx`
6. **Frontend stores the JWT token** in localStorage and redirects to dashboard

## Backend Configuration

### Security Configuration

- Custom `GoogleOAuth2SuccessHandler` that generates JWT tokens
- OAuth2 login configured to use the custom success handler
- RSA key bean for JWT signing

### OAuth2 Configuration (application.yml)

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: 444995572825-uuf77jbtuv6vf327bbiqarr4qh14na06.apps.googleusercontent.com
            client-secret: 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
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub
```

## Frontend Configuration

### OAuth2 Success Page

- Located at: `eng-fe-mess/src/app/[lang]/oauth2/success/page.tsx`
- Extracts JWT token from URL parameters
- Stores token in localStorage
- Redirects to dashboard

### OAuth2 Error Page

- Located at: `eng-fe-mess/src/app/[lang]/oauth2/error/page.tsx`
- Handles authentication failures
- Shows error message and redirects to login

### Sign-in Page

- Updated with Google login button
- Redirects to backend OAuth2 authorization endpoint

## Testing the Flow

1. **Start the backend** (eng-be-user service on port 8070)
2. **Start the frontend** (eng-fe-mess on port 3000)
3. **Navigate to**: `http://localhost:3000/sign-in`
4. **Click the Google icon** (Chrome icon)
5. **Complete Google authentication**
6. **Verify redirect to**: `http://localhost:3000/oauth2/success?token=xxx`
7. **Check localStorage** for the JWT token
8. **Verify redirect to dashboard**

## API Endpoints

- `GET /oauth2/authorization/google` - Initiates Google OAuth2 flow
- `GET /login/oauth2/code/google` - Google OAuth2 callback (handled by Spring Security)
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/google/callback` - Process Google OAuth2 callback

## JWT Token Structure

The generated JWT token includes:

- `sub`: Username
- `iss`: Issuer (http://localhost:8070)
- `aud`: Audience (http://localhost:3000)
- `authorities`: User roles
- `user`: Username
- `id`: User ID
- `email`: User email
- `iat`: Issued at
- `exp`: Expiration time
- `jti`: JWT ID

## Error Handling

- Authentication failures redirect to: `http://localhost:3000/oauth2/error?message=xxx`
- Backend errors are logged and user is redirected to error page
- Frontend shows appropriate error messages using toast notifications
