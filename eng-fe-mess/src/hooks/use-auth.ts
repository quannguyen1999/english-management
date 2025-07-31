import { useState, useEffect } from "react";
import {
  isAuthenticated,
  logout,
  getAccessToken,
  getRefreshToken,
} from "@/utils/auth";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        user: authenticated ? { token: getAccessToken() } : null,
      });
    };

    checkAuth();

    // Listen for storage changes (when tokens are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    await logout();
  };

  return {
    ...authState,
    logout: handleLogout,
  };
}
