package com.eng.controllers;

import static com.eng.constants.PathApi.USER_BY_UUID;
import static com.eng.constants.PathApi.USER_CURRENT_PROFILE;
import static com.eng.constants.PathApi.USER_FIND_NAME;
import static com.eng.constants.PathApi.USER_LIST_NAME;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eng.constants.PathApi;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.request.UserRequest;
import com.eng.models.response.UserResponse;
import com.eng.service.UserService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping(value = PathApi.USER)
@AllArgsConstructor
public class UserController {
    
    private final UserService userService;

    /**
     * Creates a new user.
     * @param userRequest The user details to create.
     * @return A response entity containing the created user details.
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userRequest));
    }

    /**
     * Retrieves a list of users with pagination.
     * @param page The page number.
     * @param size The number of items per page.
     * @param username The username to filter the list.
     * @return A response entity containing the list of users.
     */
    @GetMapping
    public ResponseEntity<CommonPageInfo<UserResponse>> getListUser(@RequestParam Integer page, @RequestParam Integer size, @RequestParam(required = false) String username, @RequestParam(required = false) List<UUID> userIds) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.listUser(page, size, username, userIds));
    }

    @PostMapping(value = USER_BY_UUID)
    public ResponseEntity<List<UserResponse>> getListUserByUUID(@RequestBody List<UUID> uuids) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getListUserByUUID(uuids));
    }

    /**
     * Updates a user.
     *
     * @param userRequest The user details to update.
     * @return A response entity containing the updated user details.
     */
    @PutMapping
    public ResponseEntity<UserResponse> updateUser(@RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.updateUser(userRequest));
    }

    /**
     * Retrieves a list of user names by their UUIDs.
     * @param uuids The list of UUIDs of the users to retrieve.
     * @return A response entity containing a map of UUIDs and their corresponding usernames.
     */
    @PostMapping(value = USER_LIST_NAME)
    public ResponseEntity<Map<UUID, String>> getListUserNames(@RequestBody List<UUID> uuids) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getListUserNames(uuids));
    }

    /**
     * Finds a user by their username.
     *
     * @param username The username of the user to find.
     * @return A response entity containing the user details.
     */
    @GetMapping(value = USER_FIND_NAME)
    public ResponseEntity<UserResponse> findUserByUsername(@RequestParam String username) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.findUserByUsername(username));
    }

    @GetMapping(value = USER_CURRENT_PROFILE)
    public ResponseEntity<UserResponse> getCurrentProfile() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getCurrentProfile());
    }

}
