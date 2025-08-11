package com.eng.service;

import java.util.List;

import com.eng.models.response.FriendRequestResponse;
import com.eng.models.response.FriendResponse;
import com.eng.models.response.PageResponse;

public interface FriendService {

    FriendRequestResponse sendFriendRequest(String receiverId);
    
    FriendRequestResponse acceptFriendRequest(String requestId);
    
    void rejectFriendRequest(String requestId);
    
    List<FriendRequestResponse> getPendingRequests();
    
    PageResponse<FriendResponse> getFriends(Integer page, Integer size, String userName);
    
    void removeFriend(String friendId);

} 