package com.eng.service.impl;

import com.eng.entities.Conversation;
import com.eng.entities.ConversationParticipant;
import com.eng.entities.Message;
import com.eng.mappers.ConversationMapper;
import com.eng.models.response.ConversationResponse;
import com.eng.repositories.ConversationRepository;
import com.eng.repositories.MessageRepository;
import com.eng.service.ConversationService;
import com.eng.utils.SecurityUtil;
import com.eng.validators.ConversationValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationMapper conversationMapper;

    private final ConversationValidator conversationValidator;

    @Override
    public List<ConversationResponse> getUserConversations() {
        UUID currentUserId = SecurityUtil.getIDUser();
        List<Conversation> conversations = conversationRepository.findByUserId(currentUserId);
        return conversations.stream()
                .map(conversationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ConversationResponse createPrivateConversation(UUID userId2) {
        conversationValidator.validateCreatePrivateConversation(userId2);

        UUID currentUserId = SecurityUtil.getIDUser();
        
        // Check if private conversation already exists
        Conversation existingConversation = conversationRepository.findPrivateConversation(currentUserId, userId2);
        if (existingConversation != null) {
            return conversationMapper.toResponse(existingConversation);
        }

        // Create new private conversation
        Conversation conversation = Conversation.builder()
                .isGroup(false)
                .createdBy(currentUserId)
                .build();

        conversation = conversationRepository.save(conversation);

        // Add participants
        ConversationParticipant participant1 = ConversationParticipant.builder()
                .conversation(conversation)
                .userId(currentUserId)
                .build();

        ConversationParticipant participant2 = ConversationParticipant.builder()
                .conversation(conversation)
                .userId(userId2)
                .build();

        conversation.getParticipants().add(participant1);
        conversation.getParticipants().add(participant2);

        return conversationMapper.toResponse(conversationRepository.save(conversation));
    }

    @Override
    @Transactional
    public ConversationResponse createGroupConversation(String name, List<UUID> participantIds) {
        UUID currentUserId = SecurityUtil.getIDUser();
        
        // Create new group conversation
        Conversation conversation = Conversation.builder()
                .isGroup(true)
                .name(name)
                .createdBy(currentUserId)
                .build();

        conversation = conversationRepository.save(conversation);

        // Add creator as participant
        ConversationParticipant creator = ConversationParticipant.builder()
                .conversation(conversation)
                .userId(currentUserId)
                .build();
        conversation.getParticipants().add(creator);

        // Add other participants
        for (UUID participantId : participantIds) {
            if (!participantId.equals(currentUserId)) {
                ConversationParticipant participant = ConversationParticipant.builder()
                        .conversation(conversation)
                        .userId(participantId)
                        .build();
                conversation.getParticipants().add(participant);
            }
        }

        return conversationMapper.toResponse(conversationRepository.save(conversation));
    }

    @Override
    @Transactional
    public void updateLastMessage(UUID conversationId, UUID messageId) {
        conversationValidator.validateUpdateLastMessage(conversationId, messageId);

        Message message = messageRepository.findById(messageId).orElseThrow();
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();
        
        conversation.setLastMessageId(messageId);
        conversation.setLastMessageAt(message.getCreateAt().toInstant());
        conversationRepository.save(conversation);
    }

    @Override
    public Conversation getConversation(UUID conversationId) {
       return conversationValidator.validateConversationId(conversationId);
    }
}