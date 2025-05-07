package com.eng.models.response;

import com.eng.entities.FriendRequest;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class UserRelationshipResponse {

    private UUID userId;

    private String username;

    private String email;

    private Instant createdAt;

    private boolean hasConversation;

    private UUID conversationId;

    private FriendRequest.FriendRequestStatus friendStatus;

    private boolean isRequestSentByMe;
    
    private boolean isOnline;
} 