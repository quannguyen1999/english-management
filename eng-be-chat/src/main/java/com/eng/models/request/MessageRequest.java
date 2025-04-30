package com.eng.models.request;

import com.eng.constants.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class MessageRequest {

    private UUID conversationId;

    @NotBlank(message = "Message content is required")
    private String content;

    @NotNull(message = "Message type is required")
    private MessageType type;

    private UUID replyTo;
} 