package com.eng.repositories;

import com.eng.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
            "WHERE p1.userId = :userId1 AND p2.userId = :userId2 AND c.isGroup = false")
    Conversation findPrivateConversation(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    List<Conversation> findByParticipantsUserId(UUID userId);

} 