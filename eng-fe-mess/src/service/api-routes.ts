import { CHAT_API, USER_API } from "@/config";

export interface ApiRouteConfig {
  baseUrl: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  requiresAuth?: boolean;
  transformRequest?: (body: any) => any;
  transformResponse?: (response: any) => any;
}

export const AUTH_SIGN_IN = "auth/sign-in";
export const AUTH_SIGN_UP = "auth/sign-up";
export const AUTH_REFRESH = "auth/refresh";
export const AUTH_LOGOUT = "auth/logout";
export const USER_PROFILE = "users/profile";
export const USER_UPDATE = "users/update";
export const USER_SEARCH = "users/search";
export const CONVERSATIONS = "conversations";
export const CONVERSATIONS_PRIVATE = "conversations/private";
export const CONVERSATIONS_GROUP = "conversations/group";
export const CONVERSATIONS_FRIEND_ALL = "conversations/friend-all";
export const FRIENDS_SEARCH = "friends/search";
export const FRIENDS_LOAD_ID = "friends/load-id";
export const FRIENDS_SEARCH_ALL = "friends/search-all";

export const API_ROUTES: Record<string, ApiRouteConfig> = {
  // Authentication routes
  [AUTH_SIGN_IN]: {
    baseUrl: USER_API,
    endpoint: "/api/auth/sign-in",
    method: "POST",
    requiresAuth: false,
  },
  [AUTH_SIGN_UP]: {
    baseUrl: USER_API,
    endpoint: "/api/users",
    method: "POST",
    requiresAuth: false,
  },
  [AUTH_REFRESH]: {
    baseUrl: USER_API,
    endpoint: "/api/auth/refresh",
    method: "POST",
    requiresAuth: false,
  },
  [AUTH_LOGOUT]: {
    baseUrl: USER_API,
    endpoint: "/api/auth/logout",
    method: "POST",
    requiresAuth: true,
  },

  // User routes
  [USER_PROFILE]: {
    baseUrl: USER_API,
    endpoint: "/api/users/current-profile",
    method: "GET",
    requiresAuth: true,
  },
  [USER_UPDATE]: {
    baseUrl: USER_API,
    endpoint: "/api/users",
    method: "PUT",
    requiresAuth: true,
  },
  [USER_SEARCH]: {
    baseUrl: USER_API,
    endpoint: "/api/users/findUserByName",
    method: "GET",
    requiresAuth: true,
  },

  // Conversation routes
  [CONVERSATIONS]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations",
    method: "GET",
    requiresAuth: true,
  },
  [CONVERSATIONS_PRIVATE]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations/private",
    method: "POST",
    requiresAuth: true,
  },
  [CONVERSATIONS_GROUP]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations/group",
    method: "POST",
    requiresAuth: true,
  },
  [CONVERSATIONS_FRIEND_ALL]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations/friend-all",
    method: "GET",
    requiresAuth: true,
  },
  // Friend routes
  [FRIENDS_SEARCH]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations/load-friend",
    method: "GET",
    requiresAuth: true,
  },
  [FRIENDS_LOAD_ID]: {
    baseUrl: CHAT_API,
    endpoint: "/api/conversations/load-id-conversation",
    method: "GET",
  },
};

// Helper function to get route config
export function getRouteConfig(path: string): ApiRouteConfig | null {
  // Strip query parameters before checking
  const basePath = path.split("?")[0];
  return API_ROUTES[basePath] || null;
}

// Helper function to check if route exists
export function routeExists(path: string): boolean {
  // Strip query parameters before checking
  const basePath = path.split("?")[0];
  return basePath in API_ROUTES;
}

// Helper function to get all available routes
export function getAllRoutes(): string[] {
  return Object.keys(API_ROUTES);
}
