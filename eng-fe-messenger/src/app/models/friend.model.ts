import { FriendStatus } from './chat.model';

export interface FriendSearchResponse {
  data: FriendSearchData[];
  total: number;
}

export interface FriendSearchData {
  userId: number;
  username: string;
  friendStatus: FriendStatus;
  conversationId: number;
  online: boolean;
  requestSentByMe: boolean;
}

export interface FriendRequest {
  userId: number;
  username: string;
  avatar: string;
  requestSentByMe: boolean;
}

export interface FriendResponse {
  userId: number;
  username: string;
  avatar: string;
  isOnline: boolean;
  friendStatus: FriendStatus;
  conversationId: number;
}

export interface PendingFriend {
  id?: string;
  requestId?: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  receiverId: string;
  status: string;
  createdAt: string;
} 