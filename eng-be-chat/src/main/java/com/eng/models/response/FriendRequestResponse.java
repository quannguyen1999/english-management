package com.eng.models.response;

import com.eng.entities.FriendRequest;
import com.eng.entities.FriendRequest.FriendRequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {

    private UUID id;
    
    private UUID senderId;
    
    private String senderUsername;
    
    private UUID receiverId;
    
    private String receiverUsername;
    
    private FriendRequestStatus status;
    
    private Date createdAt;
    
    private Date acceptedAt;
    
    private Date rejectedAt;
} 