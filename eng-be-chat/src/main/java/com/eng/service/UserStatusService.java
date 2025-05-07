package com.eng.service;

import java.util.Map;
import java.util.UUID;

public interface UserStatusService {

    void userConnected(UUID userId);

    void userDisconnected(UUID userId);

    boolean isUserOnline(UUID userId);

    Map<Object, Object> getAllUserStatuses();
} 