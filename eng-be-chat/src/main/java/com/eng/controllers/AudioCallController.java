package com.eng.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.eng.models.request.AudioCallRequest;
import com.eng.models.response.AudioCallResponse;
import com.eng.service.AudioCallService;
import com.eng.service.WebSocketService;
import com.eng.utils.SecurityUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for handling audio call operations
 */
@Slf4j
@Controller
@RequestMapping("/audio-calls")
@RequiredArgsConstructor
public class AudioCallController {
    
    private final AudioCallService audioCallService;
    private final WebSocketService webSocketService;
    
    /**
     * Initiate a new audio call
     */
    @PostMapping("/initiate")
    public ResponseEntity<AudioCallResponse> initiateCall(@RequestBody AudioCallRequest request) {
        log.info("Received audio call initiation request: {}", request);
        log.info("Request details - Conversation ID: {}, Target User ID: {}, Call Type: {}", 
                 request.getConversationId(), request.getTargetUserId(), request.getCallType());
        
        try {
            UUID callerId = getCurrentUserId();
            log.info("Current user ID from SecurityUtil: {} (type: {})", callerId, callerId.getClass().getName());
            log.info("User {} initiating audio call to user {}", callerId, request.getTargetUserId());
            
            // Validate request data
            if (request.getConversationId() == null) {
                log.error("Conversation ID is null");
                return ResponseEntity.badRequest().body(null);
            }
            
            if (request.getTargetUserId() == null) {
                log.error("Target user ID is null");
                return ResponseEntity.badRequest().body(null);
            }
            
            if (request.getCallType() == null) {
                log.error("Call type is null");
                return ResponseEntity.badRequest().body(null);
            }
            
            // Validate UUID format
            try {
                // The fields are already UUIDs, just validate they're not null
                if (request.getConversationId() == null || request.getTargetUserId() == null) {
                    log.error("UUID fields cannot be null");
                    return ResponseEntity.badRequest().body(null);
                }
                log.info("Validated UUIDs - Conversation: {}, Target: {}", 
                         request.getConversationId(), request.getTargetUserId());
            } catch (Exception e) {
                log.error("Error validating UUIDs: {}", e.getMessage());
                return ResponseEntity.badRequest().body(null);
            }
            
            log.info("Request validation passed. Proceeding with call initiation...");
            
            AudioCallResponse response = audioCallService.initiateCall(request, callerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating audio call: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    /**
     * Accept an incoming call
     */
    @PostMapping("/{callId}/accept")
    public ResponseEntity<AudioCallResponse> acceptCall(
            @PathVariable UUID callId,
            @RequestBody AudioCallRequest request) {
        UUID calleeId = getCurrentUserId();
        log.info("User {} accepting call {}", calleeId, callId);
        
        try {
            AudioCallResponse response = audioCallService.acceptCall(callId, calleeId, request.getAnswerSdp());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error accepting call: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Reject an incoming call
     */
    @PostMapping("/{callId}/reject")
    public ResponseEntity<AudioCallResponse> rejectCall(@PathVariable UUID callId) {
        UUID calleeId = getCurrentUserId();
        log.info("User {} rejecting call {}", calleeId, callId);
        
        try {
            AudioCallResponse response = audioCallService.rejectCall(callId, calleeId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rejecting call: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * End an active call
     */
    @PostMapping("/{callId}/end")
    public ResponseEntity<AudioCallResponse> endCall(@PathVariable UUID callId) {
        UUID userId = getCurrentUserId();
        log.info("User {} ending call {}", userId, callId);
        
        try {
            AudioCallResponse response = audioCallService.endCall(callId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error ending call: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get call by ID
     */
    @GetMapping("/{callId}")
    public ResponseEntity<AudioCallResponse> getCallById(@PathVariable UUID callId) {
        try {
            UUID userId = getCurrentUserId();
            AudioCallResponse response = audioCallService.getCallById(callId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting call by ID: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get active calls for current user
     */
    @GetMapping("/active")
    public ResponseEntity<List<AudioCallResponse>> getActiveCalls() {
        UUID userId = getCurrentUserId();
        try {
            List<AudioCallResponse> response = audioCallService.getActiveCallsByUserId(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting active calls: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get call history for a conversation
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<AudioCallResponse>> getCallHistory(@PathVariable UUID conversationId) {
        try {
            UUID userId = getCurrentUserId();
            List<AudioCallResponse> response = audioCallService.getCallHistoryByConversationId(conversationId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting call history: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Update call with WebRTC offer (WebSocket)
     */
    @MessageMapping("/audio-calls/{callId}/offer")
    public void handleCallOffer(@DestinationVariable UUID callId, @Payload AudioCallRequest request) {
        log.info("Received WebSocket offer for call {}: {}", callId, request);
        
        try {
            // Pass null for userId to skip authorization check in service
            audioCallService.updateCallOffer(callId, request.getOfferSdp(), null);
            
            // For forwarding, we need to get the real user IDs from the call
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                // Forward the offer to the other user via WebSocket
                forwardOfferToOtherUser(callId, request, call.getCallerId());
            }
        } catch (Exception e) {
            log.error("Error updating call offer: {}", e.getMessage(), e);
        }
    }

    /**
     * Update call with WebRTC answer (WebSocket)
     */
    @MessageMapping("/audio-calls/{callId}/answer")
    public void handleCallAnswer(@DestinationVariable UUID callId, @Payload AudioCallRequest request) {
        log.info("Received WebSocket answer for call {}: {}", callId, request);
        
        try {
            // Pass null for userId to skip authorization check in service
            audioCallService.updateCallAnswer(callId, request.getAnswerSdp(), null);
            
            // For forwarding, we need to get the real user IDs from the call
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                // Forward the answer to the other user via WebSocket
                forwardAnswerToOtherUser(callId, request, call.getCalleeId());
            }
        } catch (Exception e) {
            log.error("Error updating call answer: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle ICE candidate (WebSocket)
     */
    @MessageMapping("/audio-calls/{callId}/ice-candidate")
    public void handleIceCandidate(@DestinationVariable UUID callId, @Payload String iceCandidate) {
        log.info("Received WebSocket ICE candidate for call {}: {}", callId, iceCandidate);
        
        try {
            // For forwarding, we need to get the real user IDs from the call
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                // Use caller ID as default for ICE candidate forwarding
                forwardIceCandidateToOtherUser(callId, iceCandidate, call.getCallerId());
            }
        } catch (Exception e) {
            log.error("Error handling ICE candidate: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get current user ID from security context using SecurityUtil
     */
    private UUID getCurrentUserId() {
        try {
            return SecurityUtil.getIDUser();
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage(), e);
            throw new RuntimeException("User not authenticated or invalid token");
        }
    }

    private void forwardOfferToOtherUser(UUID callId, AudioCallRequest request, UUID userId) {
        try {
            // Get the call details to find the other user
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                UUID otherUserId = userId.equals(call.getCallerId()) ? call.getCalleeId() : call.getCallerId();
                
                // Create a notification with the offer
                AudioCallResponse offerNotification = new AudioCallResponse();
                offerNotification.setCallId(callId);
                offerNotification.setOfferSdp(request.getOfferSdp());
                offerNotification.setCallType(request.getCallType());
                offerNotification.setConversationId(request.getConversationId());
                
                // Send the offer to the other user
                webSocketService.notifyCallOffer(otherUserId, offerNotification);
                log.info("Forwarded offer for call {} to user {} (from user {})", callId, otherUserId, userId);
            }
        } catch (Exception e) {
            log.error("Error forwarding offer: {}", e.getMessage(), e);
        }
    }

    private void forwardAnswerToOtherUser(UUID callId, AudioCallRequest request, UUID userId) {
        try {
            // Get the call details to find the other user
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                UUID otherUserId = userId.equals(call.getCallerId()) ? call.getCalleeId() : call.getCallerId();
                
                // Create a notification with the answer
                AudioCallResponse answerNotification = new AudioCallResponse();
                answerNotification.setCallId(callId);
                answerNotification.setAnswerSdp(request.getAnswerSdp());
                answerNotification.setCallType(request.getCallType());
                answerNotification.setConversationId(request.getConversationId());
                
                // Send the answer to the other user
                webSocketService.notifyCallAnswer(otherUserId, answerNotification);
                log.info("Forwarded answer for call {} to user {} (from user {})", callId, otherUserId, userId);
            }
        } catch (Exception e) {
            log.error("Error forwarding answer: {}", e.getMessage(), e);
        }
    }

    private void forwardIceCandidateToOtherUser(UUID callId, String iceCandidate, UUID userId) {
        try {
            // Get the call details to find the other user
            AudioCallResponse call = audioCallService.getCallById(callId, null);
            if (call != null) {
                UUID otherUserId = userId.equals(call.getCallerId()) ? call.getCalleeId() : call.getCallerId();
                
                // Send the ICE candidate to the other user
                webSocketService.notifyIceCandidate(otherUserId, callId, iceCandidate);
                log.info("Forwarded ICE candidate for call {} to user {} (from user {})", callId, otherUserId, userId);
            }
        } catch (Exception e) {
            log.error("Error forwarding ICE candidate: {}", e.getMessage(), e);
        }
    }
} 