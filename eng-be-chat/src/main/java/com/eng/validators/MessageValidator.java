package com.eng.validators;

import com.eng.constants.MessageType;
import com.eng.entities.Message;
import com.eng.feignClient.UserServiceClient;
import com.eng.models.request.MessageRequest;
import com.eng.repositories.ConversationRepository;
import com.eng.repositories.MessageRepository;
import com.eng.utils.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import static com.eng.constants.MessageErrors.*;

@AllArgsConstructor
@Component
public class MessageValidator extends CommonValidator{

    private final UserServiceClient userServiceClient;

    private final MessageRepository messageRepository;

    private final ConversationRepository conversationRepository;

    public void validateReplyToMessage(UUID replyTo) {
        if (replyTo != null) {
            Message replyMessage = messageRepository.findById(replyTo).orElse(null);
            checkEmpty().accept(replyMessage, REPLY_MESSAGE_NOT_EXISTS);
        }
    }

    public Message validateMessageId(UUID messageId) {
        Message message = messageRepository.findById(messageId).orElse(null);
        checkEmpty().accept(message, MESSAGE_NOT_EXISTS);
        checkCondition().accept(!message.getSenderId().equals(SecurityUtil.getIDUser()), USER_DENIED);
        return message;
    }

    public void validateConversationId(UUID conversationId) {
        checkEmpty().accept(conversationRepository.findById(conversationId), CONVERSATION_NOT_EXISTS);
    }

    public void validateSendMessage(MessageRequest request, MultipartFile file) {
        checkEmpty().accept(request, MESSAGE_EMPTY);
        validateConversationId(request.getConversationId());
        checkCondition().accept(request.getType().name().equalsIgnoreCase(MessageType.AUDIO.name()) && file.isEmpty(), MESSAGE_FILE_INVALID);
    }

}
