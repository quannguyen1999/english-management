package com.eng.validators;

import com.eng.constants.MessageErrors;
import com.eng.entities.Conversation;
import com.eng.feignClient.UserServiceClient;
import com.eng.repositories.ConversationRepository;
import com.eng.repositories.MessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.UUID;

import static com.eng.constants.MessageErrors.*;

@AllArgsConstructor
@Component
public class ConversationValidator extends CommonValidator{

    private final UserServiceClient userServiceClient;

    private final ConversationRepository conversationRepository;

    private final MessageRepository messageRepository;

    public void validateCreatePrivateConversation(UUID userId) {
        checkEmpty().accept(userServiceClient.getUsernameUsers(Collections.singletonList(userId)), USER_NOT_FOUND);
    }

    public void validateUpdateLastMessage(UUID conversationId, UUID messageId){
        checkEmpty().accept(conversationRepository.findById(conversationId), CONVERSATION_NOT_EXISTS);
        checkEmpty().accept(messageRepository.findById(messageId), MESSAGE_NOT_EXISTS);
    }

    public Conversation validateConversationId(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        checkEmpty().accept(conversation, CONVERSATION_NOT_EXISTS);
        return conversation;
    }
}
