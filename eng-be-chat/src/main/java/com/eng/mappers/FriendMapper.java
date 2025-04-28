package com.eng.mappers;

import com.eng.entities.FriendRequest;
import com.eng.models.response.FriendRequestResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FriendMapper {
    FriendMapper INSTANCE = Mappers.getMapper(FriendMapper.class);

    @Mapping(target = "senderUsername", ignore = true)
    @Mapping(target = "receiverUsername", ignore = true)
    FriendRequestResponse toResponse(FriendRequest request);
} 