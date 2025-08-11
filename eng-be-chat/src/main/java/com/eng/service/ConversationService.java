package com.eng.service;

import java.util.List;
import java.util.UUID;

import com.eng.entities.Conversation;
import com.eng.models.response.ConversationResponse;
import com.eng.models.response.PageResponse;
import com.eng.models.response.UserRelationshipResponse;

public interface ConversationService {
    PageResponse<UserRelationshipResponse> getAllUserRelationConversations(Integer page, Integer size, String username);

    PageResponse<UserRelationshipResponse> loadFriendConversation(Integer page, Integer size, String username);

    List<UserRelationshipResponse> loadFriendConversationById(UUID conversationId);

    PageResponse<UserRelationshipResponse> getCurrentProfile();

    ConversationResponse createPrivateConversation(UUID userId);

    ConversationResponse createGroupConversation(String name, List<UUID> participantIds);

    void updateLastMessage(UUID conversationId, UUID messageId);

    Conversation getConversation(UUID conversationId);
}
