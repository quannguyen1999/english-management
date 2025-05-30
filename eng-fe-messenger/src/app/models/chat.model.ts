export enum FriendStatus {
  NONE = 'NONE',
  PENDING_SENT = 'PENDING_SENT',
  PENDING_RECEIVED = 'PENDING_RECEIVED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface ChatUser {
  id: string;
  userId?: string;
  username: string;
  avatar: string;
  online: boolean;
  friendStatus: FriendStatus;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  conversationId?: string | null;
  requestSentByMe?: boolean;
}

export interface Message {
  id?: string;
  content?: string;
  type?: 'TEXT' | 'IMAGE' | 'GIF' | 'AUDIO';
  senderId?: string;
  receiverId?: string;
  conversationId?: string;
  createdAt?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  replyTo?: string;
  reactions?: string[];
  isMine?: boolean;
}

export interface  MessageTypingResponse {
  userId?: string;
  username?: string;
  typing?: boolean;
}

export interface MessageStatusUserResponse {
  userId?: string;
  online?: boolean;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE',
  replyTo: string;
  deleted: boolean;
  edited: boolean;
  editedAt: string;
  version: number;
  createdAt: string;
}

export interface MessageResponsePage {
  data: Message[];
  total: number;
}


export interface Conversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FriendSearchResponse {
  page: number;
  size: number;
  total: number;
  data: FriendSearchData[];
}

export interface FriendSearchData {
  userId: string;
  username: string;
  hasConversation: boolean;
  conversationId: string | null;
  friendStatus: FriendStatus;
  requestSentByMe: boolean;
}

export interface Post {
  id: string;
  content: string;
  author: ChatUser;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  image?: string;
}

export interface SuggestedFriend {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  friendStatus: FriendStatus;
} 