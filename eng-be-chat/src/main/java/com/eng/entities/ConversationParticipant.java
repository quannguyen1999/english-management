package com.eng.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "conversation_participant")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@IdClass(ConversationParticipantId.class)
public class ConversationParticipant {

    @Id
    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID userId;

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

