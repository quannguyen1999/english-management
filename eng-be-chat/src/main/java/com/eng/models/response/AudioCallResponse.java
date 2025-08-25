package com.eng.models.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response model for audio call operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AudioCallResponse {
    
    /**
     * Unique identifier for the call
     */
    private UUID callId;
    
    /**
     * ID of the conversation where the call is happening
     */
    private UUID conversationId;
    
    /**
     * ID of the user who initiated the call
     */
    private UUID callerId;
    
    /**
     * ID of the user being called
     */
    private UUID calleeId;
    
    /**
     * Type of call (AUDIO, VIDEO)
     */
    private String callType;
    
    /**
     * Current status of the call
     */
    private String status; // INITIATED, RINGING, CONNECTED, ENDED, REJECTED
    
    /**
     * WebRTC offer SDP
     */
    private String offerSdp;
    
    /**
     * WebRTC answer SDP
     */
    private String answerSdp;
    
    /**
     * Timestamp when the call was initiated
     */
    private LocalDateTime initiatedAt;
    
    /**
     * Timestamp when the call was answered
     */
    private LocalDateTime answeredAt;
    
    /**
     * Timestamp when the call ended
     */
    private LocalDateTime endedAt;
    
    /**
     * Duration of the call in seconds (if completed)
     */
    private Long duration;
} 