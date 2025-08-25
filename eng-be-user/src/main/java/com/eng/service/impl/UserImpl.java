package com.eng.service.impl;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import com.eng.config.UserCacheConfig;
import com.eng.constants.UserRole;
import com.eng.entities.User;
import com.eng.mappers.UserMapper;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.request.UserRequest;
import com.eng.models.response.UserResponse;
import com.eng.repositories.UserRepository;
import com.eng.service.UserService;
import com.eng.utils.SecurityUtil;
import com.eng.validators.UserValidator;

import lombok.AllArgsConstructor;

/**
 * Implementation of UserService with Redis caching support.
 * Uses two main caches:
 * - USER_CACHE: For caching paginated user lists
 * - USER_DETAILS_CACHE: For caching individual user details and user name lookups
 */
@AllArgsConstructor
@Service
public class UserImpl implements UserService {

    private static final String DEFAULT_PASS_AI_TEACHER = "no-pass";

    private final UserRepository userRepository;
    private final UserValidator userValidator;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    /**
     * Creates a new user and invalidates both caches to maintain data consistency.
     * Cache eviction is necessary because:
     * 1. The new user affects pagination results in USER_CACHE
     * 2. The new user details need to be available in USER_DETAILS_CACHE
     * 
     * @param userRequest The user details to create
     * @return The created user response
     */
    @Override
    @CacheEvict(value = {UserCacheConfig.USER_CACHE, UserCacheConfig.USER_DETAILS_CACHE}, allEntries = true)
    public UserResponse createUser(UserRequest userRequest) {
        //Validate create user
        userValidator.validateCreate(userRequest);
        if (userRequest.getRole() == UserRole.AI_TEACHER) {
            userRequest.setPassword(DEFAULT_PASS_AI_TEACHER);
        }else{
            userRequest.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        userRequest.setRole(UserRole.USER);
        User user = userRepository.save(userMapper.userRequestToUser(userRequest));
        return userMapper.userToUserResponse(user);
    }

    /**
     * Retrieves a paginated list of users with optional username filtering.
     * Results are cached using a composite key of page, size, and username.
     * This improves performance for frequently accessed user lists.
     * 
     * @param page The page number (0-based)
     * @param size The number of items per page
     * @param username Optional username filter
     * @return Paginated user list
     */
    @Override
    // @Cacheable(value = UserCacheConfig.USER_CACHE, key = "#page + '-' + #size + '-' + #username")
    public CommonPageInfo<UserResponse> listUser(Integer page, Integer size, String username, List<UUID> userIds) {
        //Validate list user
        userValidator.validateGetList(page, size);
        Page<User> user = userRepository.searchUsers(username, userIds, PageRequest.of(page, size));
        return CommonPageInfo.<UserResponse>builder()
                .total(user.getTotalElements())
                .page(user.getNumber())
                .size(user.getSize())
                .data(user.getContent().stream().map(userMapper::userToUserResponse).collect(Collectors.toList()))
                .build();
    }

    @Override
    @Cacheable(value = UserCacheConfig.USER_UUID_CACHE, key = "#uuids.hashCode()")
    public List<UserResponse> getListUserByUUID(List<UUID> uuids) {
        return userRepository.findAllById(uuids).stream().map(userMapper::userToUserResponse).collect(Collectors.toList());
    }

    /**
     * Updates an existing user and invalidates both caches.
     * Cache eviction ensures that:
     * 1. Updated user details are immediately available
     * 2. Pagination results reflect the changes
     *
     * @param userRequest The updated user details
     * @return The updated user response
     */
    @Override
    @CacheEvict(value = {UserCacheConfig.USER_CACHE, UserCacheConfig.USER_DETAILS_CACHE}, allEntries = true)
    public UserResponse updateUser(UserRequest userRequest) {
        //Validate list user
        userValidator.validateUpdate(userRequest);

        User user = userRepository.findById(SecurityUtil.getIDUser()).get();
        if (StringUtils.hasLength(userRequest.getEmail())) {
            user.setEmail(userRequest.getEmail());
        }
        if (!ObjectUtils.isEmpty(userRequest.getRole())) {
            user.setRole(userRequest.getRole());
        }

        user = userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }

    /**
     * Retrieves usernames for a list of user IDs.
     * Results are cached using the hash code of the UUID list as the key.
     * This improves performance for frequent lookups of the same user IDs.
     * 
     * @param uuids List of user IDs to look up
     * @return Map of user IDs to usernames
     */
    @Override
    @Cacheable(value = UserCacheConfig.USER_DETAILS_CACHE, key = "#uuids.hashCode()")
    public Map<UUID, String> getListUserNames(List<UUID> uuids) {
        List<Object[]> results = userRepository.findUserIdAndUsernameByIds(uuids);
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],  // Convert first column to UUID
                        row -> (String) row[1] // Convert second column to String
                ));
    }

    /**
     * Finds a user by username.
     * Results are cached using the username as the key.
     * This improves performance for frequent lookups of the same user.
     *
     * @param username The username to search for
     * @return The user response or null if not found
     */
    @Override
    @Cacheable(value = UserCacheConfig.USER_DETAILS_CACHE, key = "#username")
    public UserResponse findUserByUsername(String username) {
        User user = userRepository.findUserByUsername(username);
        return ObjectUtils.isEmpty(user) ? null : userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getCurrentProfile() {
        User user = userRepository.findUserByUsername(SecurityUtil.getUserName());
        return ObjectUtils.isEmpty(user) ? null : userMapper.userToUserResponse(user);

    }
}
