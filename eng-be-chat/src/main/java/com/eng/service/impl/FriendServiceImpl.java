package com.eng.service.impl;

import com.eng.entities.FriendRequest;
import com.eng.feignClient.UserServiceClient;
import com.eng.mappers.FriendMapper;
import com.eng.models.response.FriendRequestResponse;
import com.eng.models.response.FriendResponse;
import com.eng.repositories.FriendRequestRepository;
import com.eng.service.ConversationService;
import com.eng.service.FriendService;
import com.eng.utils.SecurityUtil;
import com.eng.validators.FriendValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendMapper friendMapper;
    private final FriendValidator friendValidator;
    private final UserServiceClient userServiceClient;
    private final ConversationService conversationService;

    @Override
    @Transactional
    public FriendRequestResponse sendFriendRequest(String receiverId) {
        UUID currentUserId = SecurityUtil.getIDUser();
        friendValidator.validateSendFriendRequest(currentUserId, receiverId);

        UUID receiverUserId = UUID.fromString(receiverId);

        // Check if there's already a pending request
        FriendRequest existingRequest = friendRequestRepository.findPendingRequest(currentUserId, receiverUserId);
        if (!ObjectUtils.isEmpty(existingRequest)) {
            return friendMapper.toResponse(existingRequest);
        }

        // Create new friend request
        FriendRequest request = FriendRequest.builder()
                .senderId(currentUserId)
                .receiverId(receiverUserId)
                .status(FriendRequest.FriendRequestStatus.PENDING)
                .build();

        request = friendRequestRepository.save(request);
        return friendMapper.toResponse(request);
    }

    @Override
    @Transactional
    public FriendRequestResponse acceptFriendRequest(String requestId) {
        UUID currentUserId = SecurityUtil.getIDUser();
        FriendRequest request = friendValidator.validateFriendRequest(requestId, currentUserId);

        request.setStatus(FriendRequest.FriendRequestStatus.ACCEPTED);
        request.setAcceptedAt(new Date());
        request = friendRequestRepository.save(request);

        // Create private conversation between friends
        UUID otherUserId = request.getSenderId().equals(currentUserId) 
            ? request.getReceiverId() 
            : request.getSenderId();
        conversationService.createPrivateConversation(otherUserId);

        return friendMapper.toResponse(request);
    }

    @Override
    @Transactional
    public void rejectFriendRequest(String requestId) {
        UUID currentUserId = SecurityUtil.getIDUser();
        FriendRequest request = friendValidator.validateFriendRequest(requestId, currentUserId);

        request.setStatus(FriendRequest.FriendRequestStatus.REJECTED);
        request.setRejectedAt(new Date());
        
        friendRequestRepository.save(request);
    }

    @Override
    public List<FriendRequestResponse> getPendingRequests() {
        UUID currentUserId = SecurityUtil.getIDUser();
        List<FriendRequest> requests = friendRequestRepository.findPendingRequests(currentUserId);
        
        // Get usernames for all users involved in requests
        List<UUID> userIds = requests.stream()
                .flatMap(request -> List.of(request.getSenderId(), request.getReceiverId()).stream())
                .distinct()
                .collect(Collectors.toList());
        
        Map<UUID, String> usernames = userServiceClient.getUsernameUsers(userIds);
        
        return requests.stream()
                .map(request -> {
                    FriendRequestResponse response = friendMapper.toResponse(request);
                    response.setSenderUsername(usernames.get(request.getSenderId()));
                    response.setReceiverUsername(usernames.get(request.getReceiverId()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendResponse> getFriends() {
        UUID currentUserId = SecurityUtil.getIDUser();
        List<FriendRequest> acceptedRequests = friendRequestRepository.findAllRequests(currentUserId).stream()
                .filter(request -> request.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED).toList();
        
        // Get usernames for all friends
        List<UUID> friendIds = acceptedRequests.stream()
                .map(request -> {
                    return request.getSenderId().equals(currentUserId) ?  request.getReceiverId() : request.getSenderId();
                })
                .collect(Collectors.toList());
        
        Map<UUID, String> usernames = userServiceClient.getUsernameUsers(friendIds);
        
        return acceptedRequests.stream()
                .map(request -> {
                    UUID friendId = request.getSenderId().equals(currentUserId) 
                        ? request.getReceiverId() 
                        : request.getSenderId();
                    
                    return FriendResponse.builder()
                            .id(request.getId())
                            .userId(friendId)
                            .username(usernames.get(friendId))
                            .friendsSince(request.getAcceptedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFriend(String friendId) {
        UUID currentUserId = SecurityUtil.getIDUser();
        FriendRequest request = friendValidator.validateFriendship(currentUserId, friendId);
        friendRequestRepository.delete(request);
    }
} 