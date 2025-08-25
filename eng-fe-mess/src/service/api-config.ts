import { clearTokens, getAuthHeader, refreshAccessToken } from "@/utils/auth";
import { getAllRoutes, getRouteConfig, routeExists } from "./api-routes";

export const BASE_URL = process.env.BACKEND_API || "http://localhost:3000";

// Function to handle authentication failure
async function handleAuthFailure() {
  try {
    // Call logout API to clear HTTP-only cookies
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Failed to call logout API:", error);
  } finally {
    // Clear client-side tokens
    clearTokens();

    // Get current locale from URL or default to 'en'
    let locale = "en";
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const localeMatch = currentPath.match(/^\/([a-z]{2})/);
      if (localeMatch) {
        locale = localeMatch[1];
      }
    }

    // Redirect to sign-in page with proper locale
    if (typeof window !== "undefined") {
      window.location.href = `/${locale}/sign-in`;
    }
  }
}

export default async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  if (!routeExists(path)) {
    throw new Error(
      `API route '${path}' not found. Available routes: ${getAllRoutes().join(
        ", "
      )}`
    );
  }

  const routeConfig = getRouteConfig(path);

  if (routeConfig?.endpoint.includes("load-id-conversation")) {
    console.log("fuckhere");
    console.log(routeConfig?.endpoint);
    console.log("ended");
  }

  // Extract query parameters from the path
  const urlParts = path.split("?");
  const basePath = urlParts[0];
  const queryParams = urlParts[1] || "";

  const url = `${BASE_URL}${routeConfig?.endpoint}${
    queryParams ? `?${queryParams}` : ""
  }`;

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add authentication header if required
  if (routeConfig?.requiresAuth) {
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && routeConfig?.requiresAuth) {
    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      // Retry the request with new token
      const newAuthHeader = getAuthHeader();
      if (newAuthHeader) {
        headers.Authorization = newAuthHeader;
      }

      const retryResponse = await fetch(url, {
        headers,
        ...options,
      });

      return {
        data: await retryResponse.json(),
        status: retryResponse.status,
      };
    } else {
      // Refresh failed, handle authentication failure
      await handleAuthFailure();
      throw new Error("Authentication failed");
    }
  }

  return {
    data: await response.json(),
    status: response.status,
  };
}

// Generic method for any route
export async function call<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  return request<T>(path, options);
}
