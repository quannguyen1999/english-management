package com.eng.mappers;

import com.eng.entities.User;
import com.eng.models.request.UserRequest;
import com.eng.models.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper interface for converting between User entities and DTOs.
 * Uses MapStruct for automatic implementation generation.
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    /**
     * Converts a User entity to a UserResponse DTO.
     *
     * @param user The User entity to convert
     * @return The converted UserResponse DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "role", source = "role")
    UserResponse userToUserResponse(User user);

    /**
     * Converts a UserRequest DTO to a User entity.
     *
     * @param userRequest The UserRequest DTO to convert
     * @return The converted User entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "password", source = "password")
    @Mapping(target = "role", source = "role")
    User userRequestToUser(UserRequest userRequest);
}
