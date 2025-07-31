import { getAllRoutes, routeExists } from "./api-routes";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
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

    const url = `${this.baseUrl}/${path}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
    });

    return {
      data: await response.json(),
      status: response.status,
    };
  }

  // Authentication methods
  async signIn(credentials: { username: string; password: string }) {
    return this.request("auth/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async signUp(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    return this.request("auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async getUserProfile() {
    return this.request("users/profile");
  }

  async updateUser(userData: any) {
    return this.request("users/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async searchUsers(query: string) {
    return this.request(`users/search?name=${encodeURIComponent(query)}`);
  }

  // Conversation methods
  async getConversations() {
    return this.request("conversations");
  }

  async createPrivateConversation(data: any) {
    return this.request("conversations/private", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createGroupConversation(data: any) {
    return this.request("conversations/group", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getFriendConversations() {
    return this.request("conversations/friend-all");
  }

  // Friend methods
  async searchFriends(query: string) {
    return this.request(`friends/search?name=${encodeURIComponent(query)}`);
  }

  async getConversationId(data: any) {
    return this.request(
      `friends/load-id?${new URLSearchParams(data).toString()}`
    );
  }

  // Generic method for any route
  async call<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    return this.request<T>(path, options);
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// Export individual methods for convenience (bound to the instance)
export const signIn = apiClient.signIn.bind(apiClient);
export const signUp = apiClient.signUp.bind(apiClient);
export const getUserProfile = apiClient.getUserProfile.bind(apiClient);
export const updateUser = apiClient.updateUser.bind(apiClient);
export const searchUsers = apiClient.searchUsers.bind(apiClient);
export const getConversations = apiClient.getConversations.bind(apiClient);
export const createPrivateConversation =
  apiClient.createPrivateConversation.bind(apiClient);
export const createGroupConversation =
  apiClient.createGroupConversation.bind(apiClient);
export const getFriendConversations =
  apiClient.getFriendConversations.bind(apiClient);
export const searchFriends = apiClient.searchFriends.bind(apiClient);
export const getConversationId = apiClient.getConversationId.bind(apiClient);
export const call = apiClient.call.bind(apiClient);
