import { MessageResponsePage } from "@/types/message";
import request from "./api-config";
import {
  CONVERSATION_PARTICIPANTS,
  CONVERSATIONS_GROUP,
  CONVERSATIONS_LOAD_FRIEND,
  CONVERSATIONS_PRIVATE,
  FRIENDS_LOAD_ID,
  FRIENDS_SEARCH,
  MESSAGES,
} from "./api-routes";

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
  const params = new URLSearchParams();
  if (data.username) {
    params.append("username", data.username);
  }
  params.append("page", data.page.toString());
  params.append("size", data.size.toString());
  return request(`${CONVERSATIONS_LOAD_FRIEND}?${params.toString()}`);
}

// Friend methods
export async function searchFriends(query: string) {
  return request(`${FRIENDS_SEARCH}?name=${encodeURIComponent(query)}`);
}

export async function getConversationId(data: any) {
  return request(`${FRIENDS_LOAD_ID}?${new URLSearchParams(data).toString()}`);
}

// Message methods
export async function loadMessages(
  conversationId: string,
  page: number = 0,
  size: number = 20
): Promise<{ data: MessageResponsePage; status: number }> {
  const params = new URLSearchParams({
    conversationId,
    page: page.toString(),
    size: size.toString(),
  });
  return request<MessageResponsePage>(`${MESSAGES}?${params.toString()}`);
}

export interface ConversationParticipant {
  userId: string;
  username: string;
  email: string;
  createdAt: string; // Backend returns Instant, frontend receives as string
  hasConversation: boolean;
  conversationId: string;
  friendStatus: string;
  isRequestSentByMe: boolean;
  isOnline: boolean;
}

export const getConversationParticipants = async (
  conversationId: string
): Promise<{ data: ConversationParticipant[]; status: number }> => {
  const params = new URLSearchParams({
    conversationId,
  });
  const response = await request<ConversationParticipant[]>(
    `${CONVERSATION_PARTICIPANTS}?${params.toString()}`
  );

  // The backend returns a List<UserRelationshipResponse> directly
  // The request function wraps it in {data, status}, so we can return it as is
  return response;
};
