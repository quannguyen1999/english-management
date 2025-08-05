package com.eng.service.impl;

import com.eng.entities.Conversation;
import com.eng.entities.ConversationParticipant;
import com.eng.entities.FriendRequest;
import com.eng.entities.Message;
import com.eng.feignClient.UserServiceClient;
import com.eng.mappers.ConversationMapper;
import com.eng.models.response.ConversationResponse;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.response.PageResponse;
import com.eng.models.response.UserRelationshipResponse;
import com.eng.models.response.UserResponse;
import com.eng.repositories.ConversationParticipantRepository;
import com.eng.repositories.ConversationRepository;
import com.eng.repositories.FriendRequestRepository;
import com.eng.repositories.MessageRepository;
import com.eng.service.ConversationService;
import com.eng.service.UserStatusService;
import com.eng.utils.SecurityUtil;
import com.eng.validators.ConversationValidator;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationMapper conversationMapper;
    private final ConversationValidator conversationValidator;
    private final UserServiceClient userServiceClient;
    private final EntityManager entityManager;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final FriendRequestRepository friendRequestRepository;

    private final UserStatusService userStatusService;

    @Override
    public PageResponse<UserRelationshipResponse> getAllUserRelationConversations(Integer page, Integer size, String username) {
        UUID currentUserId = SecurityUtil.getIDUser();
        PageResponse<UserRelationshipResponse> response = new PageResponse<>();

        // Original logic for username search
        // Get paginated users from user service
        CommonPageInfo<UserResponse> userPage = userServiceClient.getUsers(
                !ObjectUtils.isEmpty(page) ? page : 0,
                !ObjectUtils.isEmpty(size) ? size : 20,
                username
        );

        // Get all friend requests for current user
        List<FriendRequest> friendRequests = friendRequestRepository.findAllRequests(currentUserId);

        // Get all conversations for current user
        List<Conversation> conversations = conversationRepository.findByParticipantsUserId(currentUserId);
        Map<UUID, UUID> conversationMap = conversations.stream()
                .flatMap(conv -> conv.getParticipants().stream()
                        .filter(p -> !p.getUserId().equals(currentUserId))
                        .map(p -> new AbstractMap.SimpleEntry<>(p.getUserId(), conv.getId())))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (existing, replacement) -> existing
                ));

        // Map to response
        List<UserRelationshipResponse> userResponses = userPage.getData().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> {
                    UserRelationshipResponse userResponse = new UserRelationshipResponse();
                    userResponse.setUserId(user.getId());
                    userResponse.setUsername(user.getUsername());
                    userResponse.setEmail(user.getEmail());
                    userResponse.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toInstant() : null);

                    // Find friend request for this user
                    FriendRequest friendRequest = friendRequests.stream()
                            .filter(request -> (request.getSenderId().equals(currentUserId) && request.getReceiverId().equals(user.getId())) ||
                                    (request.getReceiverId().equals(currentUserId) && request.getSenderId().equals(user.getId())))
                            .findFirst()
                            .orElse(null);

                    if (!ObjectUtils.isEmpty(friendRequest)) {
                        userResponse.setFriendStatus(friendRequest.getStatus());
                        userResponse.setRequestSentByMe(friendRequest.getSenderId().equals(currentUserId));
                    } else {
                        userResponse.setFriendStatus(FriendRequest.FriendRequestStatus.NONE);
                        userResponse.setRequestSentByMe(false);
                    }

                    userResponse.setConversationId(conversationMap.get(user.getId()));
                    return userResponse;
                })
                .collect(Collectors.toList());

        response.setData(userResponses);
        response.setTotal(userPage.getTotal());
        response.setPage(userPage.getPage());
        response.setSize(userPage.getSize());

        return response;
    }

    @Override
    public PageResponse<UserRelationshipResponse> loadFriendConversation(Integer page, Integer size, String username) {
        UUID currentUserId = SecurityUtil.getIDUser();
        PageResponse<UserRelationshipResponse> response = new PageResponse<>();

        // Get all friend requests for current user
        List<FriendRequest> friendRequests = friendRequestRepository.findAllRequests(currentUserId);

        // Filter only accepted friend requests
        List<UUID> friendIds = friendRequests.stream()
                .filter(request -> request.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED)
                .map(request -> request.getSenderId().equals(currentUserId) ? request.getReceiverId() : request.getSenderId()).toList();

        if (friendIds.isEmpty()) {
            // No friends found, return empty response
            response.setData(new ArrayList<>());
            response.setTotal(0L);
            response.setPage(!ObjectUtils.isEmpty(page) ? page : 0);
            response.setSize(!ObjectUtils.isEmpty(size) ? size : 20);
            return response;
        }

        // Get paginated users from user service
        CommonPageInfo<UserResponse> userPage = userServiceClient.getUsers(
                !ObjectUtils.isEmpty(page) ? page : 0,
                !ObjectUtils.isEmpty(size) ? size : 20,
                username
        );

        // Get all conversations for current user
        List<Conversation> conversations = conversationRepository.findByParticipantsUserId(currentUserId);
        Map<UUID, UUID> conversationMap = conversations.stream()
                .flatMap(conv -> conv.getParticipants().stream()
                        .filter(p -> !p.getUserId().equals(currentUserId))
                        .map(p -> new AbstractMap.SimpleEntry<>(p.getUserId(), conv.getId())))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (existing, replacement) -> existing
                ));

        // Map to response, only including friends
        List<UserRelationshipResponse> userResponses = userPage.getData().stream()
                .filter(user -> friendIds.contains(user.getId()))
                .map(user -> {
                    UserRelationshipResponse userResponse = new UserRelationshipResponse();
                    userResponse.setUserId(user.getId());
                    userResponse.setUsername(user.getUsername());
                    userResponse.setEmail(user.getEmail());
                    userResponse.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toInstant() : null);
                    userResponse.setFriendStatus(FriendRequest.FriendRequestStatus.ACCEPTED);
                    userResponse.setRequestSentByMe(friendRequests.stream()
                            .anyMatch(request -> request.getSenderId().equals(currentUserId) && request.getReceiverId().equals(user.getId())));
                    userResponse.setConversationId(conversationMap.get(user.getId()));
                    userResponse.setOnline(userStatusService.isUserOnline(user.getId()));
                    return userResponse;
                })
                .collect(Collectors.toList());

        response.setData(userResponses);
        response.setTotal(userResponses.size());
        response.setPage(userPage.getPage());
        response.setSize(userPage.getSize());

        return response;
    }

    @Override
    public List<UserRelationshipResponse> loadFriendConversationById(UUID conversationId) {
        PageResponse<UserRelationshipResponse> response = new PageResponse<>();

        // Get all conversations for current user
        Conversation conversations = conversationRepository.findById(conversationId).orElse(null);

        List<UUID> userId = conversations.getParticipants().stream()
                .filter(t -> !t.getUserId().equals(SecurityUtil.getIDUser()))
                .toList().stream().map(ConversationParticipant::getUserId).toList();

        List<UserResponse> resultFetchUser = userServiceClient.getUsersByUUID(userId);

        // Map to response, only including friends
        return resultFetchUser.stream().map(user -> {
            UserRelationshipResponse userResponse = new UserRelationshipResponse();
            userResponse.setUserId(user.getId());
            userResponse.setUsername(user.getUsername());
            userResponse.setEmail(user.getEmail());
            userResponse.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toInstant() : null);
            userResponse.setFriendStatus(FriendRequest.FriendRequestStatus.ACCEPTED);
            userResponse.setRequestSentByMe(false);
            userResponse.setConversationId(conversationId);
            userResponse.setOnline(userStatusService.isUserOnline(user.getId()));
            return userResponse;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConversationResponse createPrivateConversation(UUID userId2) {
        UUID currentUserId = SecurityUtil.getIDUser();

        // Check if private conversation already exists
        Conversation existingConversation = conversationRepository.findPrivateConversation(currentUserId, userId2);
        if (existingConversation != null) {
            return conversationMapper.toResponse(existingConversation);
        }

        // Create conversation
        Conversation conversation = new Conversation();
        conversation.setGroup(false);
        conversation.setCreatedBy(currentUserId);

        // Save conversation first to get ID
        conversation = conversationRepository.save(conversation);
        entityManager.flush(); // Ensure conversation is persisted and has ID

        // Create participants
        List<ConversationParticipant> participants = new ArrayList<>();

        // Add current user
        ConversationParticipant participant1 = new ConversationParticipant();
        participant1.setUserId(currentUserId);
        participant1.setConversationId(conversation.getId());
        participants.add(participant1);

        // Add other user
        ConversationParticipant participant2 = new ConversationParticipant();
        participant2.setUserId(userId2);
        participant2.setConversationId(conversation.getId());
        participants.add(participant2);

        // Save participants
        conversationParticipantRepository.saveAll(participants);

        return conversationMapper.toResponse(conversation);
    }

    @Override
    @Transactional
    public ConversationResponse createGroupConversation(String name, List<UUID> participantIds) {
        UUID currentUserId = SecurityUtil.getIDUser();

        // Create conversation
        Conversation conversation = new Conversation();
        conversation.setName(name);
        conversation.setGroup(true);
        conversation.setCreatedBy(currentUserId);

        // Save conversation first to get ID
        conversation = conversationRepository.save(conversation);
        entityManager.flush(); // Ensure conversation is persisted and has ID

        // Create participants list
        List<ConversationParticipant> participants = new ArrayList<>();

        // Add current user
        ConversationParticipant currentUserParticipant = new ConversationParticipant();
        currentUserParticipant.setUserId(currentUserId);
        currentUserParticipant.setConversationId(conversation.getId());
        participants.add(currentUserParticipant);

        // Add other participants
        for (UUID participantId : participantIds) {
            if (!participantId.equals(currentUserId)) {
                ConversationParticipant participant = new ConversationParticipant();
                participant.setUserId(participantId);
                participant.setConversationId(conversation.getId());
                participants.add(participant);
            }
        }

        // Save participants
        conversationParticipantRepository.saveAll(participants);

        return conversationMapper.toResponse(conversation);
    }

    @Override
    @Transactional
    public void updateLastMessage(UUID conversationId, UUID messageId) {
        conversationValidator.validateUpdateLastMessage(conversationId, messageId);

        Message message = messageRepository.findById(messageId).orElseThrow();
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();

        conversation.setLastMessageId(messageId);
        conversation.setLastMessageAt(message.getCreatedAt().toInstant());
        conversationRepository.save(conversation);
    }

    @Override
    public Conversation getConversation(UUID conversationId) {
        return conversationValidator.validateConversationId(conversationId);
    }

    @Override
    @Transactional
    public PageResponse<UserRelationshipResponse> getCurrentProfile() {
        PageResponse<UserRelationshipResponse> response = new PageResponse<>();

        // Get current user's information
        CommonPageInfo<UserResponse> userPage = userServiceClient.getUsers(0, 1, SecurityUtil.getUserName());
        if (userPage.getData().isEmpty()) {
            return response;
        }

        UserResponse currentUser = userPage.getData().get(0);

        // Create response with current user's information
        UserRelationshipResponse userResponse = new UserRelationshipResponse();
        userResponse.setUserId(currentUser.getId());
        userResponse.setUsername(currentUser.getUsername());
        userResponse.setEmail(currentUser.getEmail());
        userResponse.setCreatedAt(currentUser.getCreatedAt() != null ? currentUser.getCreatedAt().toInstant() : null);
        userResponse.setFriendStatus(FriendRequest.FriendRequestStatus.NONE);
        userResponse.setRequestSentByMe(false);

        // Set response data
        response.setData(List.of(userResponse));
        response.setTotal(1L);
        response.setPage(0);
        response.setSize(1);

        return response;
    }
}