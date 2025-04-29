package com.eng.validators;

import com.eng.entities.FriendRequest;
import com.eng.repositories.FriendRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.UUID;

import static com.eng.constants.MessageErrors.*;

@Component
@RequiredArgsConstructor
public class FriendValidator extends CommonValidator{

    private final FriendRequestRepository friendRequestRepository;

    private final com.eng.feignClient.UserServiceClient userServiceClient;

    public void validateSendFriendRequest(UUID senderId, String receiverId) {
        // Check if they are already friends
        FriendRequest existingRequest = friendRequestRepository.findPendingRequest(senderId, UUID.fromString(receiverId));
        checkCondition().accept(!ObjectUtils.isEmpty(existingRequest), FRIEND_EXISTS);
    }

    public FriendRequest validateFriendRequest(String requestId, UUID currentUserId) {
        System.out.println(currentUserId);
        System.out.println(requestId);
        FriendRequest requestLeft = friendRequestRepository.findPendingRequest(UUID.fromString(requestId), currentUserId);
        FriendRequest requestRight = friendRequestRepository.findPendingRequest(currentUserId, UUID.fromString(requestId));
        FriendRequest request = ObjectUtils.isEmpty(requestLeft) ? requestRight : requestLeft;
        checkEmpty().accept(request, FRIEND_NOT_FOUND);
        checkCondition().accept(request.getStatus() != FriendRequest.FriendRequestStatus.PENDING, FRIEND_NOT_PENDING);
        return request;
    }

    public FriendRequest validateFriendship(UUID currentUserId, String friendId) {
        List<FriendRequest> requests = friendRequestRepository.findAllRequests(currentUserId);
        
        FriendRequest friendRequest = requests.stream()
                .filter(request -> {
                    boolean isSender = request.getSenderId().equals(currentUserId);
            
                    UUID otherUserId = isSender ? request.getReceiverId() : request.getSenderId();
                    return otherUserId.equals(UUID.fromString(friendId)) && request.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED;
                })
                .findFirst()
                .orElseThrow(null);

        checkEmpty().accept(friendRequest, FRIEND_NOT_FOUND);

        return friendRequest;
    }
} 