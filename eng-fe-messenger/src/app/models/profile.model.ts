export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  createdAt: number;
  hasConversation: boolean;
  conversationId: string | null;
  friendStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestSentByMe: boolean;
}

export interface JwtPayload {
  sub: string;
  aud: string;
  nbf: number;
  iss: string;
  id: string;
  exp: number;
  iat: number;
  user: string;
  authorities: string[];
} 

// Add interface for paginated response
export interface PaginatedUserProfileResponse {
  page: number;
  size: number;
  total: number;
  data: UserProfile[];
  __typename?: string | null;
}