package com.eng.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eng.entities.AudioCall;

/**
 * Repository interface for AudioCall entity operations
 */
@Repository
public interface AudioCallRepository extends JpaRepository<AudioCall, UUID> {
    
    /**
     * Find active calls for a user (either as caller or callee)
     */
    @Query("SELECT ac FROM AudioCall ac WHERE (ac.callerId = :userId OR ac.calleeId = :userId) " +
           "AND ac.status IN ('INITIATED', 'RINGING', 'CONNECTED')")
    List<AudioCall> findActiveCallsByUserId(@Param("userId") UUID userId);
    
    /**
     * Find calls by conversation ID
     */
    List<AudioCall> findByConversationIdOrderByInitiatedAtDesc(UUID conversationId);
    
    /**
     * Find the most recent call between two users
     */
    @Query("SELECT ac FROM AudioCall ac WHERE " +
           "((ac.callerId = :user1Id AND ac.calleeId = :user2Id) OR " +
           "(ac.callerId = :user2Id AND ac.calleeId = :user1Id)) " +
           "ORDER BY ac.initiatedAt DESC")
    List<AudioCall> findCallsBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);
    
    /**
     * Find calls by status
     */
    List<AudioCall> findByStatus(AudioCall.CallStatus status);
    
    /**
     * Check if user has an active call
     */
    @Query("SELECT COUNT(ac) > 0 FROM AudioCall ac WHERE (ac.callerId = :userId OR ac.calleeId = :userId) " +
           "AND ac.status IN ('INITIATED', 'RINGING', 'CONNECTED')")
    boolean hasActiveCall(@Param("userId") UUID userId);
} 