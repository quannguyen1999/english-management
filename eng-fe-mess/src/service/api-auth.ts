import request from "./api-config";
import {
  AUTH_LOGOUT,
  AUTH_SIGN_IN,
  AUTH_SIGN_UP,
  CONVERSATIONS,
  CONVERSATIONS_FRIEND_ALL,
  CONVERSATIONS_GROUP,
  CONVERSATIONS_PRIVATE,
  FRIENDS_LOAD_ID,
  FRIENDS_SEARCH,
  USER_PROFILE,
  USER_SEARCH,
  USER_UPDATE,
} from "./api-routes";

export interface SignInProps {
  username: string;
  password: string;
}

export interface SignUpProps {
  username: string;
  email: string;
  password: string;
}

// Authentication methods
export async function signIn(credentials: SignInProps) {
  return request(AUTH_SIGN_IN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function signUp(userData: SignUpProps) {
  return request(AUTH_SIGN_UP, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return request(AUTH_LOGOUT, {
    method: "POST",
  });
}

// User methods
export async function getUserProfile() {
  return request(USER_PROFILE);
}

export async function updateUser(userData: any) {
  return request(USER_UPDATE, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function searchUsers(query: string) {
  return request(`${USER_SEARCH}?name=${encodeURIComponent(query)}`);
}

// Conversation methods
export async function getConversations() {
  return request(CONVERSATIONS);
}

export async function createPrivateConversation(data: any) {
  return request(CONVERSATIONS_PRIVATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createGroupConversation(data: any) {
  return request(CONVERSATIONS_GROUP, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFriendConversations() {
  return request(CONVERSATIONS_FRIEND_ALL);
}

// Friend methods
export async function searchFriends(query: string) {
  return request(`${FRIENDS_SEARCH}?name=${encodeURIComponent(query)}`);
}

export async function getConversationId(data: any) {
  return request(`${FRIENDS_LOAD_ID}?${new URLSearchParams(data).toString()}`);
}
