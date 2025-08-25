package com.eng.entities;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Conversation")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Conversation extends CommonBaseEntities{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "is_group")
    private boolean isGroup;

    private String name;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<ConversationParticipant> participants;

    @Column(name = "last_message_id", columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID lastMessageId;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "created_by", columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID createdBy;

    /**
     * Checks if this conversation is an AI conversation
     * @return true if this is an AI conversation, false otherwise
     */
    public boolean isAIConversation() {
        if (participants == null || participants.size() != 2) {
            return false;
        }
        
        // Check if one of the participants is an AI teacher
        return participants.stream()
                .anyMatch(participant -> {
                    // This would need to be enhanced to check the actual user role
                    // For now, we'll check if the conversation name indicates AI
                    return "AI English Teacher".equals(name);
                });
    }
}

