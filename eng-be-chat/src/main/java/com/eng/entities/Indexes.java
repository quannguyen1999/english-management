package com.eng.entities;

import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Table(indexes = {
    @Index(name = "idx_conversation_last_message_at", columnList = "last_message_at"),
    @Index(name = "idx_conversation_created_by", columnList = "created_by"),
    @Index(name = "idx_message_conversation_id", columnList = "conversation_id"),
    @Index(name = "idx_message_sender_id", columnList = "sender_id"),
    @Index(name = "idx_message_reply_to", columnList = "reply_to"),
    @Index(name = "idx_message_status_user_id", columnList = "user_id"),
    @Index(name = "idx_message_status_status", columnList = "status"),
    @Index(name = "idx_conversation_participant_user_id", columnList = "user_id")
})
public class Indexes {
    // This class is used to define indexes for the entities
} 