package com.eng.feignClient.fallBack;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eng.feignClient.UserServiceClient;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.response.UserResponse;
import com.eng.utils.SecurityUtil;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class UserFallback implements UserServiceClient {

    @Override
    public Map<UUID, String> getUsernameUsers(List<UUID> listUserId) {
        log.error("Fallback triggered for getUsernameUsers with userIds: {}", listUserId);
        log.error("Stack trace:", new Exception("Fallback stack trace"));
        Map<UUID, String> fallbackMap = new HashMap<>();
        listUserId.forEach(id -> fallbackMap.put(id, "Unknown User"));
        log.error("Returning fallback map: {}", fallbackMap);
        return fallbackMap;
    }

    @Override
    public CommonPageInfo<UserResponse> getUsers(int page, int size, String username, List<UUID> userIds) {
        log.error("Fallback triggered for getUsers with page={}, size={}, username={}", page, size, username);
        log.error("Stack trace:", new Exception("Fallback stack trace"));
        
        // Create a fallback user response with current user's information
        UserResponse fallbackUser = new UserResponse();
        UUID currentUserId = SecurityUtil.getIDUser();
        String currentUsername = SecurityUtil.getUserName();
        
        log.error("Current user info - ID: {}, Username: {}", currentUserId, currentUsername);
        
        fallbackUser.setId(currentUserId);
        fallbackUser.setUsername(currentUsername);
        fallbackUser.setEmail("unknown@example.com");

        CommonPageInfo<UserResponse> response = CommonPageInfo.<UserResponse>builder()
                .data(List.of(fallbackUser))
                .total(1L)
                .page(page)
                .size(size)
                .build();

        log.error("Returning fallback response: {}", response);
        return response;
    }

    @Override
    public List<UserResponse> getUsersByUUID(List<UUID> userIds) {
        return null;
    }
}
