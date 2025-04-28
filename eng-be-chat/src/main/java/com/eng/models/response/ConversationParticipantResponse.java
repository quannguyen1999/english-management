package com.eng.models.response;

import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
public class ConversationParticipantResponse {
    
    private UUID userId;

    private String username;

    private Date joinedAt;

    private String avatar;

}

