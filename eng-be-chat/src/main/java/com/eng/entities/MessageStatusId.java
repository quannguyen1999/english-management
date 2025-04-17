package com.eng.entities;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageStatusId implements Serializable {
    
    @ManyToOne
    @JoinColumn(name = "message_id")
    private Message message;

    @Column(columnDefinition = "char(36)")
    private UUID userId;
} 