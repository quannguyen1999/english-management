package com.eng.repositories;

import com.eng.entities.MessageStatus;
import com.eng.entities.MessageStatusId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, MessageStatusId> {
    @Query("SELECT ms FROM MessageStatus ms WHERE ms.message.id = :messageId AND ms.userId = :userId")
    MessageStatus findByMessageIdAndUserId(@Param("messageId") UUID messageId, @Param("userId") UUID userId);
} 