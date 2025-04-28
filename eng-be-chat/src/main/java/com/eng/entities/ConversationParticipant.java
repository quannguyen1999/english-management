package com.eng.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "conversation_participant")
@IdClass(ConversationParticipantId.class)
public class ConversationParticipant {

    @Id
    @Column(name = "conversation_id", columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID conversationId;

    @Id
    @Column(name = "user_id", columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", insertable = false, updatable = false)
    private Conversation conversation;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "joined_at")
    private Date joinedAt;

    /**
     * JPA lifecycle callback that is triggered before an entity is persisted.
     * Sets both createAt and updatedAt timestamps to the current time.
     */
    @PrePersist
    protected void onCreate() {
        joinedAt = new Date();
    }

}

