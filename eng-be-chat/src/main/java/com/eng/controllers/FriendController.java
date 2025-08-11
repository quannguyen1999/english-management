package com.eng.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eng.constants.PathApi;
import com.eng.models.response.FriendRequestResponse;
import com.eng.models.response.FriendResponse;
import com.eng.models.response.PageResponse;
import com.eng.service.FriendService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(PathApi.FRIEND)
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping(PathApi.FRIEND_SEND)
    public ResponseEntity<FriendRequestResponse> sendFriendRequest(@RequestParam String receiverId) {
        return ResponseEntity.ok(friendService.sendFriendRequest(receiverId));
    }

    @GetMapping(PathApi.FRIEND_ACCEPT)
    public ResponseEntity<FriendRequestResponse> acceptFriendRequest(@RequestParam String requestId) {
        return ResponseEntity.ok(friendService.acceptFriendRequest(requestId));
    }

    @GetMapping(PathApi.FRIEND_REJECT)
    public ResponseEntity<Void> rejectFriendRequest(@RequestParam String requestId) {
        friendService.rejectFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping(PathApi.FRIEND_REQUEST_PENDING)
    public ResponseEntity<List<FriendRequestResponse>> getPendingRequests() {
        return ResponseEntity.ok(friendService.getPendingRequests());
    }

    @GetMapping
    public ResponseEntity<PageResponse<FriendResponse>> getFriends(@RequestParam Integer page,
                                                           @RequestParam Integer size,
                                                        String username) {
        return ResponseEntity.ok(friendService.getFriends(page, size, username));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFriend(@RequestParam String friendId) {
        friendService.removeFriend(friendId);
        return ResponseEntity.ok().build();
    }
} 