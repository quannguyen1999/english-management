package com.eng.entities;

import com.eng.constants.MessageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "Message")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Message extends CommonBaseEntities {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID senderId;

    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Column(name = "reply_to", columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID replyTo;

    @Column(name = "is_deleted")
    private boolean deleted = false;

    @Column(name = "is_edited")
    private boolean edited = false;

    @Column(name = "edited_at")
    private Date editedAt;

    @Version
    private Long version;
}

