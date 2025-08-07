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

export interface MessageResponse {
  id: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
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

export interface MessageTypingResponse {
  userId?: string;
  username?: string;
  typing?: boolean;
}

export interface MessageStatusUserResponse {
  userId?: string;
  online?: boolean;
} 