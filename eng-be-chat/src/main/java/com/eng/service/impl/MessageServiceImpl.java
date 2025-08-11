package com.eng.service.impl;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import com.eng.constants.MessageStatusType;
import com.eng.entities.ConversationParticipant;
import com.eng.entities.Message;
import com.eng.entities.MessageStatus;
import com.eng.mappers.MessageMapper;
import com.eng.models.request.MessageRequest;
import com.eng.models.response.MessageResponse;
import com.eng.models.response.PageResponse;
import com.eng.repositories.MessageRepository;
import com.eng.repositories.MessageStatusRepository;
import com.eng.service.ConversationService;
import com.eng.service.MessageService;
import com.eng.service.WebSocketService;
import com.eng.utils.SecurityUtil;
import com.eng.validators.MessageValidator;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final ConversationService conversationService;
    private final MessageValidator messageValidator;
    private final MessageMapper messageMapper;
    private final WebSocketService webSocketService;

    @Override
    public PageResponse<MessageResponse> getMessages(UUID conversationId, Pageable pageable) {
        PageResponse<MessageResponse> response = new PageResponse<>();

        messageValidator.validateConversationId(conversationId);

        Page<Message> messages = messageRepository.findByConversationId(conversationId, pageable);

        messages.map(messageMapper::toResponse);

        response.setData(messages.getContent().stream().map(messageMapper::toResponse).collect(Collectors.toList()));
        response.setTotal(messages.getTotalElements());
        response.setPage(pageable.getPageNumber());
        response.setSize(pageable.getPageSize());

        return response;
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageRequest messageRequest, MultipartFile file) {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
        messageValidator.validateSendMessage(messageRequest, file);

        UUID currentUserId = SecurityUtil.getIDUser();

        Message message = Message.builder()
                .conversation(conversationService.getConversation(messageRequest.getConversationId()))
                .senderId(currentUserId)
                .content(messageRequest.getContent())
                .type(messageRequest.getType())
                .replyTo(messageRequest.getReplyTo())
                .build();

        message = messageRepository.save(message);
        conversationService.updateLastMessage(messageRequest.getConversationId(), message.getId());

        // Create message status for all participants
        List<UUID> participantIds = message.getConversation().getParticipants().stream()
                .map(ConversationParticipant::getUserId)
                .toList();

        for (UUID participantId : participantIds) {
            MessageStatus status = MessageStatus.builder()
                    .message(message)
                    .userId(participantId)
                    .status(MessageStatusType.SENT)
                    .build();
            messageStatusRepository.save(status);
        }

        MessageResponse response = messageMapper.toResponse(message);

        // Send real-time notification
        webSocketService.sendMessage(messageRequest.getConversationId(), response);

        return response;
                
            } catch (Exception e) {
                // Check if it's a deadlock error
                if (e.getMessage() != null && 
                    (e.getMessage().contains("Deadlock") || 
                     e.getMessage().contains("LockAcquisitionException")) && 
                    retryCount < maxRetries - 1) {
                    
                    retryCount++;
                    try {
                        // Exponential backoff: 100ms, 200ms, 300ms
                        Thread.sleep(100 * retryCount);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    continue;
                }
                // If it's not a deadlock or we've exhausted retries, throw the exception
                throw e;
            }
        }
        
        throw new RuntimeException("Failed to send message after " + maxRetries + " retries due to deadlocks");
    }

    @Override
    @Transactional
    public MessageResponse editMessage(UUID messageId, String newContent) {
        Message message = messageValidator.validateMessageId(messageId);
        message.setContent(newContent);
        message.setEdited(true);
        message.setEditedAt(new Date());

        MessageResponse response = messageMapper.toResponse(messageRepository.save(message));

        // Send real-time notification
        webSocketService.sendMessage(message.getConversation().getId(), response);

        return response;
    }

    @Override
    @Transactional
    public void deleteMessage(UUID messageId) {
        Message message = messageValidator.validateMessageId(messageId);
        message.setDeleted(true);
        messageRepository.save(message);

        // Send real-time notification
        webSocketService.sendMessage(message.getConversation().getId(), messageMapper.toResponse(message));
    }

    @Override
    @Transactional
    public void markMessageAsDelivered(UUID messageId) {
        messageValidator.validateMessageId(messageId);

        UUID currentUserId = SecurityUtil.getIDUser();

        MessageStatus status = messageStatusRepository.findByMessageIdAndUserId(messageId, currentUserId);
        if (status != null && status.getStatus() == MessageStatusType.SENT) {
            status.setStatus(MessageStatusType.DELIVERED);
            status.setDeliveredAt(new Date());
            messageStatusRepository.save(status);

            // Send real-time notification
            webSocketService.notifyMessageDelivered(
                    status.getMessage().getConversation().getId(),
                    messageId,
                    currentUserId
            );
        }
    }

    @Override
    @Transactional
    public void markMessageAsRead(UUID messageId) {
        messageValidator.validateMessageId(messageId);

        UUID currentUserId = SecurityUtil.getIDUser();

        MessageStatus status = messageStatusRepository.findByMessageIdAndUserId(messageId, currentUserId);
        if (!ObjectUtils.isEmpty(status) && status.getStatus() != MessageStatusType.READ) {
            status.setStatus(MessageStatusType.READ);
            status.setReadAt(new Date());
            messageStatusRepository.save(status);

            // Send real-time notification
            webSocketService.notifyMessageRead(
                    status.getMessage().getConversation().getId(),
                    messageId,
                    currentUserId
            );
        }
    }

    @Override
    @Transactional
    public void addReaction(UUID messageId, String reaction) {
        messageValidator.validateMessageId(messageId);

        UUID currentUserId = SecurityUtil.getIDUser();

        MessageStatus status = messageStatusRepository.findByMessageIdAndUserId(messageId, currentUserId);
        if (!ObjectUtils.isEmpty(status)) {
            status.setReaction(reaction);
            messageStatusRepository.save(status);

            // Send real-time notification
            webSocketService.notifyMessageReaction(
                    status.getMessage().getConversation().getId(),
                    messageId,
                    currentUserId,
                    reaction
            );
        }
    }
}