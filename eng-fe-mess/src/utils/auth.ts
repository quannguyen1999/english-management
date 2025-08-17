import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user: string;
  id: string;
  exp: number;
  iat: number;
}

// Token management utilities
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Save tokens to localStorage
export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  localStorage.setItem("token_type", tokens.token_type);
  localStorage.setItem("expires_in", tokens.expires_in.toString());
  localStorage.setItem("scope", tokens.scope);
  localStorage.setItem("token_created_at", Date.now().toString());
}

// Get access token from localStorage
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

// Get refresh token from localStorage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("refresh_token");
}

// Check if token is expired
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const expiresIn = localStorage.getItem("expires_in");
  const tokenCreatedAt = localStorage.getItem("token_created_at");

  if (!expiresIn || !tokenCreatedAt) {
    return true;
  }

  const expirationTime = parseInt(tokenCreatedAt) + parseInt(expiresIn) * 1000;
  return Date.now() >= expirationTime;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && !isTokenExpired();
}

// Clear all tokens
export function clearTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("scope");
    localStorage.removeItem("token_created_at");
  }
}

// Get authorization header
export function getAuthHeader(): string | null {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("access_token");
  return token ? `Bearer ${token}` : null;
}

// Refresh token function
export async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }

  return false;
}

// Logout function
export async function logout(): Promise<void> {
  try {
    // Call logout API to clear server-side cookies
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    // Clear client-side tokens
    clearTokens();

    // Redirect to sign-in page
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken.id;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function getCurrentUsername(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken.user;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
