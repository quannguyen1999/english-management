package com.eng.controllers;

import com.eng.constants.PathApi;
import com.eng.models.request.GroupConversationRequest;
import com.eng.models.response.ConversationResponse;
import com.eng.models.response.PageResponse;
import com.eng.models.response.UserRelationshipResponse;
import com.eng.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(PathApi.CONVERSATION)
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;

    @GetMapping(PathApi.CONVERSATION_LOAD_FRIEND)
    public ResponseEntity<PageResponse<UserRelationshipResponse>> loadFriendConversation(
            @RequestParam Integer page,
            @RequestParam Integer size,
            String username
    ) {
        return ResponseEntity.ok(conversationService.loadFriendConversation(page, size, username));
    }

    @GetMapping(PathApi.CONVERSATION_FRIEND_ALL)
    public ResponseEntity<PageResponse<UserRelationshipResponse>> getNotFriendConversations(
            @RequestParam Integer page,
            @RequestParam Integer size,
            String username
    ) {
        return ResponseEntity.ok(conversationService.getAllUserRelationConversations(page, size, username));
    }

    @GetMapping(PathApi.CONVERSATION_CURRENT_PROFILE)
    public ResponseEntity<PageResponse<UserRelationshipResponse>> getCurrentProfile() {
        System.out.println("fuck fuck ");
        return ResponseEntity.ok(conversationService.getCurrentProfile());
    }

    @GetMapping(PathApi.CONVERSATION_PRIVATE)
    public ResponseEntity<ConversationResponse> createPrivateConversation(@RequestParam UUID userId) {
        return ResponseEntity.ok(conversationService.createPrivateConversation(userId));
    }

    @PostMapping(PathApi.CONVERSATION_GROUP)
    public ResponseEntity<ConversationResponse> createGroupConversation(
            @Valid @RequestBody GroupConversationRequest request) {
        return ResponseEntity.ok(conversationService.createGroupConversation(
                request.getName(),
                request.getParticipantIds()
        ));
    }
} 