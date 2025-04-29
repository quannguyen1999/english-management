package com.eng.repositories;

import com.eng.entities.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {
    
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
            "(fr.receiverId = :userId) " +
            "AND fr.status = 'PENDING'")
    List<FriendRequest> findPendingRequests(@Param("userId") UUID userId);

    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "fr.senderId = :senderId AND fr.receiverId = :receiverId " +
           "AND fr.status = 'PENDING'")
    FriendRequest findPendingRequest(@Param("senderId") UUID senderId, @Param("receiverId") UUID receiverId);

    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "fr.senderId = :userId OR fr.receiverId = :userId")
    List<FriendRequest> findAllRequests(@Param("userId") UUID userId);
} 