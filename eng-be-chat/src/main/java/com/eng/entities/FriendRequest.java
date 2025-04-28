package com.eng.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "friend_requests")
@Builder
public class FriendRequest extends CommonBaseEntities {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "sender_id", nullable = false, columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID senderId;

    @Column(name = "receiver_id", nullable = false, columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status;

    @Column(name = "accepted_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date acceptedAt;

    @Column(name = "rejected_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date rejectedAt;

    public enum FriendRequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        NONE
    }
} 