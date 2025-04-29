export interface User {
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  requestSentByMe?: boolean;
  friendStatus?: string;
  conversationId?: string;
}

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt?: Date;
  lastSeen?: Date;
  isOnline?: boolean;
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UserError {
  message: string;
  details: string[];
} 