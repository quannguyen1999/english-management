package com.eng.mappers;

import com.eng.entities.Conversation;
import com.eng.models.response.ConversationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationResponse toResponse(Conversation conversation);
}
