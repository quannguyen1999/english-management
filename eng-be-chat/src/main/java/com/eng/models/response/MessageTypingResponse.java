package com.eng.models.response;

import lombok.Data;

import java.util.UUID;

@Data
public class MessageTypingResponse {
    private UUID userId;

    private String username;

    private Boolean typing;
}
