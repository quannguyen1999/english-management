package com.eng.service.impl;

import com.eng.service.UserStatusService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Slf4j
@AllArgsConstructor
@Service
public class UserStatusServiceImpl implements UserStatusService {
    private static final String ONLINE_USERS_KEY = "online_users";
    private static final Duration USER_TIMEOUT = Duration.ofMinutes(5);
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void userConnected(UUID userId) {
        log.info("User {} connected", userId);
        redisTemplate.opsForHash().put(ONLINE_USERS_KEY, userId, "ONLINE");
        redisTemplate.expire(ONLINE_USERS_KEY, USER_TIMEOUT);
    }

    @Override
    public void userDisconnected(UUID userId) {
        log.info("User {} disconnected", userId);
        redisTemplate.opsForHash().put(ONLINE_USERS_KEY, userId, "OFFLINE");
    }

    @Override
    public boolean isUserOnline(UUID userId) {
        String status = (String) redisTemplate.opsForHash().get(ONLINE_USERS_KEY, userId);
        return "ONLINE".equals(status);
    }

    @Override
    public Map<Object, Object> getAllUserStatuses() {
        return redisTemplate.opsForHash().entries(ONLINE_USERS_KEY);
    }
}
