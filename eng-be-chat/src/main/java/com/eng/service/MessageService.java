package com.eng.service;

import com.eng.constants.MessageType;
import com.eng.models.response.MessageResponse;
import com.eng.models.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MessageService {

    PageResponse<MessageResponse> getMessages(UUID conversationId, Pageable pageable);

    MessageResponse sendMessage(UUID conversationId, String content, MessageType type, UUID replyTo);

    MessageResponse editMessage(UUID messageId, String newContent);

    void deleteMessage(UUID messageId);

    void markMessageAsDelivered(UUID messageId);

    void markMessageAsRead(UUID messageId);

    void addReaction(UUID messageId, String reaction);

} 