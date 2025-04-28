package com.eng.controllers;

import com.eng.constants.PathApi;
import com.eng.models.response.FriendRequestResponse;
import com.eng.models.response.FriendResponse;
import com.eng.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<FriendResponse>> getFriends() {
        return ResponseEntity.ok(friendService.getFriends());
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFriend(@RequestParam String friendId) {
        friendService.removeFriend(friendId);
        return ResponseEntity.ok().build();
    }
} 