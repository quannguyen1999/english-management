package com.eng.feignClient.fallBack;

import com.eng.feignClient.UserServiceClient;
import com.eng.models.response.PageResponse;
import com.eng.models.response.UserResponse;
import com.eng.utils.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    public PageResponse<UserResponse> getUsers(int page, int size, String username) {
        log.error("Fallback triggered for getUsers with page={}, size={}, username={}", page, size, username);
        log.error("Stack trace:", new Exception("Fallback stack trace"));
        
        PageResponse<UserResponse> response = new PageResponse<>();
        
        // Create a fallback user response with current user's information
        UserResponse fallbackUser = new UserResponse();
        UUID currentUserId = SecurityUtil.getIDUser();
        String currentUsername = SecurityUtil.getUserName();
        
        log.error("Current user info - ID: {}, Username: {}", currentUserId, currentUsername);
        
        fallbackUser.setId(currentUserId);
        fallbackUser.setUsername(currentUsername);
        fallbackUser.setEmail("unknown@example.com");

        response.setData(List.of(fallbackUser));
        response.setTotal(1L);
        response.setPage(page);
        response.setSize(size);

        log.error("Returning fallback response: {}", response);
        return response;
    }

    @Override
    public List<UserResponse> getUsersByUUID(List<UUID> userIds) {
        return null;
    }
}
