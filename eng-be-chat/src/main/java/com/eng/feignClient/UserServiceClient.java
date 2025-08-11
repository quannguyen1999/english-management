package com.eng.feignClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.eng.config.FeignClientConfig;
import com.eng.constants.PathApi;
import com.eng.feignClient.fallBack.UserFallback;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.response.UserResponse;

/**
 * Use for call external service
 * 
*/
@FeignClient(name = "eng-user-service", configuration = FeignClientConfig.class, fallback = UserFallback.class)
public interface UserServiceClient {

    /**
     * Get username users
     *
     * @param listUserId
     * @return
     */
    @PostMapping(value = PathApi.USER + PathApi.USER_LIST_NAME)
    Map<UUID, String> getUsernameUsers(@RequestBody List<UUID> listUserId);

    @GetMapping(value = PathApi.USER)
    CommonPageInfo<UserResponse> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) List<UUID> userIds
    );

    @PostMapping(value = PathApi.USER + PathApi.USER_BY_UUID)
    List<UserResponse> getUsersByUUID(
            @RequestBody List<UUID> userIds
    );

}
