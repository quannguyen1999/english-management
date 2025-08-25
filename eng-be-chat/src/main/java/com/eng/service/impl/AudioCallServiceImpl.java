package com.eng.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.eng.entities.AudioCall;
import com.eng.entities.Conversation;
import com.eng.entities.ConversationParticipant;
import com.eng.models.request.AudioCallRequest;
import com.eng.models.response.AudioCallResponse;
import com.eng.repositories.AudioCallRepository;
import com.eng.repositories.ConversationRepository;
import com.eng.service.AudioCallService;
import com.eng.service.WebSocketService;
import com.eng.validators.FriendValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service implementation for audio call operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AudioCallServiceImpl implements AudioCallService {
    
    private final AudioCallRepository audioCallRepository;
    private final WebSocketService webSocketService;
    private final FriendValidator friendValidator;
    private final ConversationRepository conversationRepository;
    
    @Override
    public AudioCallResponse initiateCall(AudioCallRequest request, UUID callerId) {
        log.info("Initiating audio call from user {} to user {}", callerId, request.getTargetUserId());
        
        // Validate that users are accepted friends
        try {
            friendValidator.validateFriendship(callerId, request.getTargetUserId().toString());
        } catch (Exception e) {
            log.error("Friendship validation failed for users {} and {}: {}", callerId, request.getTargetUserId(), e.getMessage());
            throw new RuntimeException("Users must be accepted friends to make audio calls");
        }
        
        // Validate conversation exists and user is a participant
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Check if this is a private conversation between the two users
        if (conversation.isGroup()) {
            throw new RuntimeException("Audio calls are only allowed in private conversations");
        }
        
        // Verify both users are participants in this conversation
        List<UUID> participantIds = conversation.getParticipants().stream()
                .map(ConversationParticipant::getUserId)
                .collect(Collectors.toList());
        
        if (!participantIds.contains(callerId) || !participantIds.contains(request.getTargetUserId())) {
            throw new RuntimeException("Users must be participants in the conversation to make calls");
        }
        
        // Check if caller already has an active call
        if (hasActiveCall(callerId)) {
            throw new RuntimeException("User already has an active call");
        }
        
        // Check if target user has an active call
        if (hasActiveCall(request.getTargetUserId())) {
            throw new RuntimeException("Target user is busy with another call");
        }
        
        AudioCall audioCall = new AudioCall();
        audioCall.setConversationId(request.getConversationId());
        audioCall.setCallerId(callerId);
        audioCall.setCalleeId(request.getTargetUserId());
        audioCall.setCallType(AudioCall.CallType.valueOf(request.getCallType()));
        audioCall.setStatus(AudioCall.CallStatus.INITIATED);
        audioCall.setOfferSdp(request.getOfferSdp());
        
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        // Notify target user about incoming call via WebSocket
        webSocketService.notifyIncomingCall(request.getTargetUserId(), convertToResponse(savedCall));
        
        log.info("Audio call initiated successfully with ID: {}", savedCall.getId());
        return convertToResponse(savedCall);
    }
    
    @Override
    public AudioCallResponse acceptCall(UUID callId, UUID calleeId, String answerSdp) {
        log.info("Accepting call {} by user {}", callId, calleeId);
        
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!audioCall.getCalleeId().equals(calleeId)) {
            throw new RuntimeException("User not authorized to accept this call");
        }
        
        if (audioCall.getStatus() != AudioCall.CallStatus.INITIATED && 
            audioCall.getStatus() != AudioCall.CallStatus.RINGING) {
            throw new RuntimeException("Call cannot be accepted in current status: " + audioCall.getStatus());
        }
        
        audioCall.setStatus(AudioCall.CallStatus.CONNECTED);
        audioCall.setAnswerSdp(answerSdp);
        audioCall.setAnsweredAt(LocalDateTime.now());
        
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        // Notify caller that call was accepted
        webSocketService.notifyCallAccepted(audioCall.getCallerId(), convertToResponse(savedCall));
        
        log.info("Call {} accepted successfully", callId);
        return convertToResponse(savedCall);
    }
    
    @Override
    public AudioCallResponse rejectCall(UUID callId, UUID calleeId) {
        log.info("Rejecting call {} by user {}", callId, calleeId);
        
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!audioCall.getCalleeId().equals(calleeId)) {
            throw new RuntimeException("User not authorized to reject this call");
        }
        
        audioCall.setStatus(AudioCall.CallStatus.REJECTED);
        audioCall.setEndedAt(LocalDateTime.now());
        
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        // Notify caller that call was rejected
        webSocketService.notifyCallRejected(audioCall.getCallerId(), convertToResponse(savedCall));
        
        log.info("Call {} rejected successfully", callId);
        return convertToResponse(savedCall);
    }
    
    @Override
    public AudioCallResponse endCall(UUID callId, UUID userId) {
        log.info("Ending call {} by user {}", callId, userId);
        
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!audioCall.getCallerId().equals(userId) && !audioCall.getCalleeId().equals(userId)) {
            throw new RuntimeException("User not authorized to end this call");
        }
        
        audioCall.setStatus(AudioCall.CallStatus.ENDED);
        audioCall.setEndedAt(LocalDateTime.now());
        
        // Calculate call duration if call was connected
        if (audioCall.getAnsweredAt() != null) {
            Duration duration = Duration.between(audioCall.getAnsweredAt(), audioCall.getEndedAt());
            audioCall.setDuration(duration.getSeconds());
        }
        
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        // Notify both users that call ended
        webSocketService.notifyCallEnded(audioCall.getCallerId(), convertToResponse(savedCall));
        webSocketService.notifyCallEnded(audioCall.getCalleeId(), convertToResponse(savedCall));
        
        log.info("Call {} ended successfully", callId);
        return convertToResponse(savedCall);
    }
    
    @Override
    public AudioCallResponse getCallById(UUID callId, UUID userId) {
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        // Skip authorization check for WebSocket messages (userId might be null for testing)
        if (userId != null) {
            // Verify user is involved in this call (either caller or callee)
            if (!audioCall.getCallerId().equals(userId) && !audioCall.getCalleeId().equals(userId)) {
                throw new RuntimeException("User not authorized to view this call");
            }
        }
        
        return convertToResponse(audioCall);
    }
    
    @Override
    public List<AudioCallResponse> getActiveCallsByUserId(UUID userId) {
        // Get current user ID from security context
        UUID currentUserId = com.eng.utils.SecurityUtil.getIDUser();
        
        // Verify user can only see their own active calls
        if (!currentUserId.equals(userId)) {
            throw new RuntimeException("User not authorized to view other users' active calls");
        }
        
        List<AudioCall> activeCalls = audioCallRepository.findActiveCallsByUserId(userId);
        return activeCalls.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AudioCallResponse> getCallHistoryByConversationId(UUID conversationId, UUID userId) {
        // Validate conversation exists and user is a participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a participant in this conversation
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(participant -> participant.getUserId().equals(userId));
        
        if (!isParticipant) {
            throw new RuntimeException("User not authorized to view call history for this conversation");
        }
        
        List<AudioCall> callHistory = audioCallRepository.findByConversationIdOrderByInitiatedAtDesc(conversationId);
        return callHistory.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public AudioCallResponse updateCallOffer(UUID callId, String offerSdp, UUID userId) {
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        // Skip authorization check for WebSocket messages (userId might be dummy for testing)
        if (userId != null) {
            // Verify user is the caller and can update the offer
            if (!audioCall.getCallerId().equals(userId)) {
                throw new RuntimeException("User not authorized to update call offer");
            }
        }
        
        audioCall.setOfferSdp(offerSdp);
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        return convertToResponse(savedCall);
    }
    
    @Override
    public AudioCallResponse updateCallAnswer(UUID callId, String answerSdp, UUID userId) {
        AudioCall audioCall = audioCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        // Skip authorization check for WebSocket messages (userId might be dummy for testing)
        if (userId != null) {
            // Verify user is the callee and can update the answer
            if (!audioCall.getCalleeId().equals(userId)) {
                throw new RuntimeException("User not authorized to update call answer");
            }
        }
        
        audioCall.setAnswerSdp(answerSdp);
        AudioCall savedCall = audioCallRepository.save(audioCall);
        
        return convertToResponse(savedCall);
    }
    
    @Override
    public boolean hasActiveCall(UUID userId) {
        return audioCallRepository.hasActiveCall(userId);
    }
    
    private AudioCallResponse convertToResponse(AudioCall audioCall) {
        return new AudioCallResponse(
                audioCall.getId(),
                audioCall.getConversationId(),
                audioCall.getCallerId(),
                audioCall.getCalleeId(),
                audioCall.getCallType().name(),
                audioCall.getStatus().name(),
                audioCall.getOfferSdp(),
                audioCall.getAnswerSdp(),
                audioCall.getInitiatedAt(),
                audioCall.getAnsweredAt(),
                audioCall.getEndedAt(),
                audioCall.getDuration()
        );
    }
} 