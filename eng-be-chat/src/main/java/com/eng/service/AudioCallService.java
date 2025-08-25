package com.eng.service;

import java.util.List;
import java.util.UUID;

import com.eng.models.request.AudioCallRequest;
import com.eng.models.response.AudioCallResponse;

/**
 * Service interface for audio call operations
 */
public interface AudioCallService {
    
    /**
     * Initiate a new audio call
     */
    AudioCallResponse initiateCall(AudioCallRequest request, UUID callerId);
    
    /**
     * Accept an incoming call
     */
    AudioCallResponse acceptCall(UUID callId, UUID calleeId, String answerSdp);
    
    /**
     * Reject an incoming call
     */
    AudioCallResponse rejectCall(UUID callId, UUID calleeId);
    
    /**
     * End an active call
     */
    AudioCallResponse endCall(UUID callId, UUID userId);
    
    /**
     * Get call by ID
     */
    AudioCallResponse getCallById(UUID callId, UUID userId);
    
    /**
     * Get active calls for a user
     */
    List<AudioCallResponse> getActiveCallsByUserId(UUID userId);
    
    /**
     * Get call history for a conversation
     */
    List<AudioCallResponse> getCallHistoryByConversationId(UUID conversationId, UUID userId);
    
    /**
     * Update call with WebRTC offer
     */
    AudioCallResponse updateCallOffer(UUID callId, String offerSdp, UUID userId);
    
    /**
     * Update call with WebRTC answer
     */
    AudioCallResponse updateCallAnswer(UUID callId, String answerSdp, UUID userId);
    
    /**
     * Check if user has active call
     */
    boolean hasActiveCall(UUID userId);
} 