package com.eng.feignClient;

import com.eng.config.FeignClientConfig;
import com.eng.constants.PathApi;
import com.eng.feignClient.fallBack.UserFallback;
import com.eng.models.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Use for call external service
 * 
*/
@FeignClient(name = "prime-user-service", configuration = FeignClientConfig.class, fallback = UserFallback.class)
public interface UserServiceClient {

    /**
     * Get username users
     * @param listUserId
     * @return
     */
    @PostMapping(value = PathApi.USER + PathApi.LIST_USER_NAME)
    Map<UUID, String> getUsernameUsers(List<UUID> listUserId);

    /**
     * Find user by username
     * @param username
     * @return
     */
    @GetMapping(value = PathApi.USER + PathApi.FIND_USER_NAME)
    UserResponse findUserByUsername(@RequestParam String username);

}
