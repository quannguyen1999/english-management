package com.eng.models.response;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ConversationResponse {

    private UUID id;

    private boolean isGroup;

    private String name;

    private List<ConversationParticipantResponse> participants;

}
