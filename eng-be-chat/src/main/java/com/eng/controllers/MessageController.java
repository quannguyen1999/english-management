package com.eng.controllers;

import com.eng.models.request.MessageRequest;
import com.eng.models.response.MessageResponse;
import com.eng.models.response.PageResponse;
import com.eng.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.eng.constants.PathApi.*;

@RestController
@RequestMapping(MESSAGE)
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<PageResponse<MessageResponse>> getMessages(
            @RequestParam UUID conversationId,
            @RequestParam Integer page,
            @RequestParam Integer size) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, PageRequest.of(page, size)));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(
                request.getConversationId(),
                request.getContent(),
                request.getType(),
                request.getReplyTo()
        ));
    }

    @PutMapping
    public ResponseEntity<MessageResponse> editMessage(
            @RequestParam UUID conversationId,
            @RequestParam UUID messageId,
            @Valid @RequestBody String newContent) {
        return ResponseEntity.ok(messageService.editMessage(messageId, newContent));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMessage(
            @RequestParam UUID messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_DELIVERED)
    public ResponseEntity<Void> markMessageAsDelivered(
            @RequestParam UUID messageId) {
        messageService.markMessageAsDelivered(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_READ)
    public ResponseEntity<Void> markMessageAsRead(
            @RequestParam UUID messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_REACTION)
    public ResponseEntity<Void> addReaction(
            @RequestParam UUID messageId,
            @RequestParam String reaction) {
        messageService.addReaction(messageId, reaction);
        return ResponseEntity.ok().build();
    }
} 