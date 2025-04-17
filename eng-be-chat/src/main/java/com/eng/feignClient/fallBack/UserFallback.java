package com.eng.feignClient.fallBack;

import com.eng.exceptions.BadRequestException;
import com.eng.feignClient.UserServiceClient;
import com.eng.models.response.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.eng.constants.MessageErrors.USER_SERVER_ERROR;

@Component
@Slf4j
public class UserFallback implements UserServiceClient {
    @Override
    public Map<UUID, String> getUsernameUsers(List<UUID> listUserId) {
        throw new BadRequestException(USER_SERVER_ERROR);
    }

    @Override
    public UserResponse findUserByUsername(String username) {
        throw new BadRequestException(USER_SERVER_ERROR);
    }
}
