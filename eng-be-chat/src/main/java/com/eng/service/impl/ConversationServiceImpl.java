package com.eng.service.impl;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import com.eng.entities.Conversation;
import com.eng.entities.ConversationParticipant;
import com.eng.entities.FriendRequest;
import com.eng.entities.Message;
import com.eng.feignClient.UserServiceClient;
import com.eng.mappers.ConversationMapper;
import com.eng.models.request.CommonPageInfo;
import com.eng.models.response.ConversationResponse;
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
                username,
                null
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
        List<UUID> friendIdsAccepted = friendRequests.stream()
                .filter(request -> request.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED)
                .map(request -> request.getSenderId().equals(currentUserId) ? request.getReceiverId() : request.getSenderId()).toList();

        if (friendIdsAccepted.isEmpty()) {
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
                username,
                friendIdsAccepted
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
                .filter(user -> friendIdsAccepted.contains(user.getId()))
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
    public ConversationResponse createAIConversation() {
        UUID currentUserId = SecurityUtil.getIDUser();

        // Find or create default AI teacher user
        UUID aiTeacherId = findOrCreateDefaultAITeacher();

        // Check if AI conversation already exists
        Conversation existingConversation = conversationRepository.findPrivateConversation(currentUserId, aiTeacherId);
        if (existingConversation != null) {
            return conversationMapper.toResponse(existingConversation);
        }

        // Create conversation
        Conversation conversation = new Conversation();
        conversation.setGroup(false);
        conversation.setName("AI English Teacher");
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

        // Add AI teacher
        ConversationParticipant participant2 = new ConversationParticipant();
        participant2.setUserId(aiTeacherId);
        participant2.setConversationId(conversation.getId());
        participants.add(participant2);

        // Save participants
        conversationParticipantRepository.saveAll(participants);

        return conversationMapper.toResponse(conversation);
    }

    @Override
    public List<ConversationResponse> getAIConversations() {
        UUID currentUserId = SecurityUtil.getIDUser();
        
        // Get all conversations for current user
        List<Conversation> conversations = conversationRepository.findByParticipantsUserId(currentUserId);
        
        // Filter AI conversations
        return conversations.stream()
                .filter(Conversation::isAIConversation)
                .map(conversationMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Finds or creates a default AI teacher user
     * @return UUID of the AI teacher user
     */
    private UUID findOrCreateDefaultAITeacher() {
        // First, test if user service is reachable
        if (!isUserServiceReachable()) {
            throw new RuntimeException(
                "User service is not reachable. Please ensure:\n" +
                "1. The user service is running on http://localhost:8070\n" +
                "2. Network connectivity is working\n" +
                "3. No firewall is blocking the connection"
            );
        }
        
        // Try to find existing AI teacher by username
        try {
            System.out.println("🔍 Searching for AI teacher by username 'ai_teacher'...");
            CommonPageInfo<UserResponse> aiTeacherPage = userServiceClient.getUsers(0, 1, "ai_teacher", null);
            System.out.println("✅ User service call successful, found " + aiTeacherPage.getData().size() + " users");
            
            if (!aiTeacherPage.getData().isEmpty()) {
                UserResponse aiTeacher = aiTeacherPage.getData().get(0);
                System.out.println("👤 Found user: " + aiTeacher.getUsername() + " with role: " + aiTeacher.getRole());
                
                if (aiTeacher.getRole() != null && aiTeacher.getRole().name().equals("AI_TEACHER")) {
                    System.out.println("🎯 Found AI teacher with ID: " + aiTeacher.getId());
                    return aiTeacher.getId();
                } else {
                    System.out.println("⚠️ User found but role is not AI_TEACHER: " + aiTeacher.getRole());
                }
            } else {
                System.out.println("ℹ️ No users found with username 'ai_teacher'");
            }
        } catch (Exception e) {
            System.err.println("❌ Error finding existing AI teacher by username: " + e.getMessage());
            e.printStackTrace();
        }

        // Try to find by the predefined UUID
        String defaultAiTeacherId = "00000000-0000-0000-0000-000000000001";
        
        try {
            System.out.println("🔍 Searching for AI teacher by UUID: " + defaultAiTeacherId);
            UUID aiTeacherId = UUID.fromString(defaultAiTeacherId);
            
            // Create the list with the UUID
            List<UUID> uuidList = List.of(aiTeacherId);
            System.out.println("📤 Sending request to user service with UUIDs: " + uuidList);
            System.out.println("📤 UUID list type: " + uuidList.getClass().getName());
            System.out.println("📤 First UUID: " + uuidList.get(0) + " (type: " + uuidList.get(0).getClass().getName() + ")");
            
            // Verify the user exists by trying to get it
            List<UserResponse> aiTeacherList = userServiceClient.getUsersByUUID(uuidList);
            System.out.println("✅ User service call successful, received " + aiTeacherList.size() + " users");
            
            if (!aiTeacherList.isEmpty()) {
                UserResponse aiTeacher = aiTeacherList.get(0);
                System.out.println("👤 Found user by UUID: " + aiTeacher.getUsername() + " with role: " + aiTeacher.getRole());
                
                if (aiTeacher.getRole() != null && aiTeacher.getRole().name().equals("AI_TEACHER")) {
                    System.out.println("🎯 Found AI teacher by UUID with ID: " + aiTeacher.getId());
                    return aiTeacherId;
                } else {
                    System.out.println("⚠️ User found by UUID but role is not AI_TEACHER: " + aiTeacher.getRole());
                }
            } else {
                System.out.println("ℹ️ No users found with UUID: " + defaultAiTeacherId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error verifying default AI teacher by UUID: " + e.getMessage());
            e.printStackTrace();
            
            // Additional debugging for the specific error
            if (e.getMessage() != null && e.getMessage().contains("extracting response")) {
                System.err.println("🔍 This appears to be a JSON parsing error from the user service");
                System.err.println("🔍 The user service might be returning malformed JSON or not running");
            }
        }
        
        // If we still can't find an AI teacher, provide clear instructions
        throw new RuntimeException(
            "AI Teacher user not found. Please ensure one of the following:\n" +
            "1. The user service is running and accessible at http://localhost:8070\n" +
            "2. Run the database migration V20250825230000__create_ai_teacher_user.sql\n" +
            "3. Create an AI_TEACHER user manually with:\n" +
            "   - Username: 'ai_teacher'\n" +
            "   - Role: 'AI_TEACHER'\n" +
            "   - UUID: '00000000-0000-0000-0000-000000000001' (optional)\n" +
            "4. Check if the user service is properly configured and running\n" +
            "5. Verify network connectivity between chat service and user service\n" +
            "6. Check user service logs for any errors"
        );
    }

    /**
     * Simple health check to test if user service is reachable
     * @return true if user service is reachable, false otherwise
     */
    private boolean isUserServiceReachable() {
        try {
            System.out.println("🏥 Testing user service connectivity...");
            // Try a simple call to see if the service responds
            CommonPageInfo<UserResponse> testResponse = userServiceClient.getUsers(0, 1, null, null);
            System.out.println("✅ User service is reachable, received response with " + testResponse.getData().size() + " users");
            return true;
        } catch (Exception e) {
            System.err.println("❌ User service is not reachable: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
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
        CommonPageInfo<UserResponse> userPage = userServiceClient.getUsers(0, 1, SecurityUtil.getUserName(), null);
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