import { USER_API, BACKEND_API } from "@/config";

export interface ApiRouteConfig {
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  transformRequest?: (body: any) => any;
  transformResponse?: (response: any) => any;
  isOAuth2?: boolean; // Special flag for OAuth2 authentication
}

export const API_ROUTES: Record<string, ApiRouteConfig> = {
  // Authentication routes
  'auth/sign-in': {
    baseUrl: USER_API,
    endpoint: '/oauth2/token',
    method: 'POST',
    requiresAuth: false,
    isOAuth2: true
  },
  'auth/sign-up': {
    baseUrl: USER_API,
    endpoint: '/users',
    method: 'POST',
    requiresAuth: false
  },
  
  // User routes
  'users/profile': {
    baseUrl: USER_API,
    endpoint: '/users/current-profile',
    method: 'GET',
    requiresAuth: true
  },
  'users/update': {
    baseUrl: USER_API,
    endpoint: '/users',
    method: 'PUT',
    requiresAuth: true
  },
  'users/search': {
    baseUrl: USER_API,
    endpoint: '/users/findUserByName',
    method: 'GET',
    requiresAuth: true
  },
  
  // Conversation routes
  'conversations': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations',
    method: 'GET',
    requiresAuth: true
  },
  'conversations/private': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations/private',
    method: 'POST',
    requiresAuth: true
  },
  'conversations/group': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations/group',
    method: 'POST',
    requiresAuth: true
  },
  'conversations/friend-all': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations/friend-all',
    method: 'GET',
    requiresAuth: true
  },
  
  // Friend routes
  'friends/search': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations/load-friend',
    method: 'GET',
    requiresAuth: true
  },
  'friends/load-id': {
    baseUrl: `${BACKEND_API}/chat-service`,
    endpoint: '/conversations/load-id-conversation',
    method: 'GET',
    requiresAuth: true
  }
};

// Helper function to get route config
export function getRouteConfig(path: string): ApiRouteConfig | null {
  return API_ROUTES[path] || null;
}

// Helper function to check if route exists
export function routeExists(path: string): boolean {
  return path in API_ROUTES;
}

// Helper function to get all available routes
export function getAllRoutes(): string[] {
  return Object.keys(API_ROUTES);
} 