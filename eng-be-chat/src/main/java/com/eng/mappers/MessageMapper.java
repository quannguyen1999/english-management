package com.eng.mappers;

import com.eng.entities.Message;
import com.eng.models.response.MessageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(source = "conversation.id", target = "conversationId")
    MessageResponse toResponse(Message message);
}
