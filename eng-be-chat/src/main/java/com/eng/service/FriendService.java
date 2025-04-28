package com.eng.service;

import com.eng.models.response.FriendRequestResponse;
import com.eng.models.response.FriendResponse;

import java.util.List;

public interface FriendService {

    FriendRequestResponse sendFriendRequest(String receiverId);
    
    FriendRequestResponse acceptFriendRequest(String requestId);
    
    void rejectFriendRequest(String requestId);
    
    List<FriendRequestResponse> getPendingRequests();
    
    List<FriendResponse> getFriends();
    
    void removeFriend(String friendId);

} 