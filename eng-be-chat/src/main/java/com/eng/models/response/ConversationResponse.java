package com.eng.models.response;

import com.eng.entities.ConversationParticipant;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ConversationResponse {

    private UUID id;

    private boolean isGroup;

    private String name;

}
