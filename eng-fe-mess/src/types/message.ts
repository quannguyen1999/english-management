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

// Audio Call Types
export interface AudioCallResponse {
  callId: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  callType: string;
  status: string;
  offerSdp?: string;
  answerSdp?: string;
  initiatedAt: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number;
}

export interface IncomingCallNotification {
  type: "INCOMING_CALL";
  data: AudioCallResponse;
}

export interface CallAcceptedNotification {
  type: "CALL_ACCEPTED";
  data: AudioCallResponse;
}

export interface CallRejectedNotification {
  type: "CALL_REJECTED";
  data: AudioCallResponse;
}

export interface CallEndedNotification {
  type: "CALL_ENDED";
  data: AudioCallResponse;
}

export type AudioCallNotification =
  | IncomingCallNotification
  | CallAcceptedNotification
  | CallRejectedNotification
  | CallEndedNotification;
