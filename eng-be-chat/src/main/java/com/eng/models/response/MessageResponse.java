package com.eng.models.response;

import com.eng.constants.MessageType;
import com.eng.entities.Conversation;
import com.eng.entities.Message;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Date;
import java.util.UUID;

@Data
public class MessageResponse {
    private UUID id;

    private UUID senderId;

    private String content;

    private MessageType type;

    private UUID replyTo;

    private boolean deleted;

    private boolean edited;

    private Date editedAt;

    private Long version;

    private Date createdAt;

}
