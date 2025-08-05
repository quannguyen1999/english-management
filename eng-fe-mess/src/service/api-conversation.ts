import request from "./api-config";
import {
  CONVERSATIONS,
  CONVERSATIONS_FRIEND_ALL,
  CONVERSATIONS_GROUP,
  CONVERSATIONS_PRIVATE,
  FRIENDS_LOAD_ID,
  FRIENDS_SEARCH,
} from "./api-routes";

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

interface FriendSearchData {
  username: string;
  page: number;
  size: number;
}

export async function getFriendConversations(data: FriendSearchData) {
  const params = new URLSearchParams({
    username: data.username,
    page: data.page.toString(),
    size: data.size.toString(),
  });
  return request(`${CONVERSATIONS_FRIEND_ALL}?${params.toString()}`);
}

// Friend methods
export async function searchFriends(query: string) {
  return request(`${FRIENDS_SEARCH}?name=${encodeURIComponent(query)}`);
}

export async function getConversationId(data: any) {
  return request(`${FRIENDS_LOAD_ID}?${new URLSearchParams(data).toString()}`);
}
