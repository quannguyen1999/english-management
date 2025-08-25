package com.eng.models.request;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request model for audio call operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AudioCallRequest {
    
    /**
     * ID of the conversation where the call is initiated
     */
    private UUID conversationId;
    
    /**
     * ID of the user being called
     */
    private UUID targetUserId;
    
    /**
     * Type of call (AUDIO, VIDEO)
     */
    private String callType;
    
    /**
     * WebRTC offer SDP for call initiation
     */
    private String offerSdp;
    
    /**
     * WebRTC answer SDP for call acceptance
     */
    private String answerSdp;
    
    /**
     * ICE candidate for WebRTC connection
     */
    private String iceCandidate;
} 