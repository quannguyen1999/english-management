package com.eng.entities;

import com.eng.constants.MessageStatusType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "message_status")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@IdClass(MessageStatusId.class)
public class MessageStatus {

    @Id
    @ManyToOne
    @JoinColumn(name = "message_id")
    private Message message;

    @Id
    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MessageStatusType status = MessageStatusType.SENT;

    @Column(name = "read_at")
    private Date readAt;

    @Column(name = "delivered_at")
    private Date deliveredAt;

    @Column(name = "reaction")
    private String reaction;

}

