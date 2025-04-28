package com.eng.controllers;

import com.eng.models.request.MessageRequest;
import com.eng.models.response.MessageResponse;
import com.eng.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable UUID conversationId,
            Pageable pageable) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, pageable));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable UUID conversationId,
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(
                conversationId,
                request.getContent(),
                request.getType(),
                request.getReplyTo()
        ));
    }

    @PutMapping(MESSAGE_UPDATE)
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId,
            @Valid @RequestBody String newContent) {
        return ResponseEntity.ok(messageService.editMessage(messageId, newContent));
    }

    @DeleteMapping(MESSAGE_DELETE)
    public ResponseEntity<Void> deleteMessage(
            @PathVariable UUID messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_DELIVERED)
    public ResponseEntity<Void> markMessageAsDelivered(
            @PathVariable UUID messageId) {
        messageService.markMessageAsDelivered(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_READ)
    public ResponseEntity<Void> markMessageAsRead(
            @PathVariable UUID messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(MESSAGE_REACTION)
    public ResponseEntity<Void> addReaction(
            @PathVariable UUID messageId,
            @RequestParam String reaction) {
        messageService.addReaction(messageId, reaction);
        return ResponseEntity.ok().build();
    }
} 