package com.eng.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.eng.models.request.CommonPageInfo;
import com.eng.models.request.UserRequest;
import com.eng.models.response.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest userRequest);

    CommonPageInfo<UserResponse> listUser(Integer page, Integer size, String username, List<UUID> userIds);

    List<UserResponse> getListUserByUUID(List<UUID> uuids);

    UserResponse updateUser(UserRequest userRequest);

    Map<UUID, String> getListUserNames(List<UUID> uuids);

    UserResponse findUserByUsername(String username);

    UserResponse getCurrentProfile();

}
