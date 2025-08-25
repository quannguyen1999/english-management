package com.eng.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eng.constants.PathApi;
import com.eng.models.request.GroupConversationRequest;
import com.eng.models.response.ConversationResponse;
import com.eng.models.response.PageResponse;
import com.eng.models.response.UserRelationshipResponse;
import com.eng.service.ConversationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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

    @GetMapping(PathApi.CONVERSATION_LOAD_ID)
    public ResponseEntity<List<UserRelationshipResponse>> loadFriendConversation(
            @RequestParam UUID conversationId
    ) {
        return ResponseEntity.ok(conversationService.loadFriendConversationById(conversationId));
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

    @PostMapping(PathApi.CONVERSATION_AI)
    public ResponseEntity<ConversationResponse> createAIConversation() {
        return ResponseEntity.ok(conversationService.createAIConversation());
    }

    @GetMapping(PathApi.CONVERSATION_AI)
    public ResponseEntity<List<ConversationResponse>> getAIConversations() {
        return ResponseEntity.ok(conversationService.getAIConversations());
    }
} 