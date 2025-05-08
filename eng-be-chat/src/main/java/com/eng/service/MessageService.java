package com.eng.service;

import com.eng.models.request.MessageRequest;
import com.eng.models.response.MessageResponse;
import com.eng.models.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface MessageService {

    PageResponse<MessageResponse> getMessages(UUID conversationId, Pageable pageable);

    MessageResponse sendMessage(MessageRequest messageRequest, MultipartFile file);

    MessageResponse editMessage(UUID messageId, String newContent);

    void deleteMessage(UUID messageId);

    void markMessageAsDelivered(UUID messageId);

    void markMessageAsRead(UUID messageId);

    void addReaction(UUID messageId, String reaction);

} 