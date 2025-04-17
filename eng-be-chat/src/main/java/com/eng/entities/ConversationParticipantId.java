package com.eng.entities;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Embeddable
public class ConversationParticipantId implements Serializable {
    private String conversation;

    private String user;
}