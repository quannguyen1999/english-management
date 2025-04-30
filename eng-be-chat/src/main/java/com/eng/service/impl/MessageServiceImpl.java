package com.eng.service.impl;

import com.eng.constants.MessageStatusType;
import com.eng.constants.MessageType;
import com.eng.entities.ConversationParticipant;
import com.eng.entities.Message;
import com.eng.entities.MessageStatus;
import com.eng.mappers.MessageMapper;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public MessageResponse sendMessage(UUID conversationId, String content, MessageType type, UUID replyTo) {
        messageValidator.validateConversationId(conversationId);
//        messageValidator.validateReplyToMessage(replyTo);

        UUID currentUserId = SecurityUtil.getIDUser();

        Message message = Message.builder()
                .conversation(conversationService.getConversation(conversationId))
                .senderId(currentUserId)
                .content(content)
                .type(type)
                .replyTo(replyTo)
                .build();

        message = messageRepository.save(message);
        conversationService.updateLastMessage(conversationId, message.getId());

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
        webSocketService.sendMessage(conversationId, response);

        return response;
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