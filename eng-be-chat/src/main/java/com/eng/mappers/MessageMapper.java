package com.eng.mappers;

import com.eng.entities.Message;
import com.eng.models.response.MessageResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageResponse toResponse(Message message);
}
