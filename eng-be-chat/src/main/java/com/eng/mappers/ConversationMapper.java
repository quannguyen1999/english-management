package com.eng.mappers;

import com.eng.entities.Conversation;
import com.eng.models.response.ConversationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ConversationMapper {
    ConversationMapper INSTANCE = Mappers.getMapper(ConversationMapper.class);

    ConversationResponse toResponse(Conversation conversation);
}
