package com.eng.controllers;

import com.eng.constants.PathApi;
import com.eng.models.request.CreateGroupConversationRequest;
import com.eng.models.response.ConversationResponse;
import com.eng.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.eng.constants.PathApi.*;

@RestController
@RequestMapping(CONVERSATION)
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getUserConversations() {
        return ResponseEntity.ok(conversationService.getUserConversations());
    }

    @PostMapping(PRIVATE_CONVERSATION)
    public ResponseEntity<ConversationResponse> createPrivateConversation(@PathVariable UUID userId) {
        return ResponseEntity.ok(conversationService.createPrivateConversation(userId));
    }

    @PostMapping(GROUP_CONVERSATION)
    public ResponseEntity<ConversationResponse> createGroupConversation(
            @Valid @RequestBody CreateGroupConversationRequest request) {
        return ResponseEntity.ok(conversationService.createGroupConversation(
                request.getName(),
                request.getParticipantIds()
        ));
    }
} 