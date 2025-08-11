export interface Message {
  id?: string;
  conversationId?: string;
  senderId?: string;
  content?: string;
  type: "TEXT" | "IMAGE" | "GIF" | "AUDIO" | "VIDEO" | "FILE";
  replyTo?: string | null;
  deleted?: boolean;
  edited?: boolean;
  editedAt?: string | null;
  version?: number;
  createdAt?: number;
  receiverId?: string;
  status?: "SENT" | "DELIVERED" | "READ";
  reactions?: string[] | null;
  isMine?: boolean;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "FILE";
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
