package com.eng.constants;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.UUID;

/**
 * Interface defining all API endpoint paths used throughout the application.
 * This centralizes all API route definitions to maintain consistency and make updates easier.
 * 
 * The paths are organized by feature area:
 * - User management endpoints
 * - Authentication and authorization endpoints
 */
public interface PathApi {

    // User Management Endpoints
    /**
     * Base path for all user-related operations
     */
    String USER = "/users";
    /**
     * Path for retrieving a list of user names
     */
    String LIST_USER_NAME = "/getListUserNames";
    /**
     * Path for finding a user by their name
     */
    String FIND_USER_NAME = "/findUserByName";

    // Authentication and Authorization Endpoints
    /** Path for authentication operations */
    String AUTHENTICATOR_PATH = "/authenticator";
    /** Path for OAuth2 authorization */
    String AUTHORIZE_PATH = "/oauth2/authorize";
    /** Path for user registration */
    String REGISTRATION_PATH = "/registration";

    // Conversation Management Endpoints
    /**
     * Base path for all conversation-related operations
     */
    String CONVERSATION = "/conversations";

    String PRIVATE_CONVERSATION = "/private/{userId}";

    String GROUP_CONVERSATION = "/group";

    // Message Management Endpoints
    /**
     * Base path for all message-related operations
     */
    String MESSAGE = "/messages/{conversationId}";

    String UPDATE_MESSAGE = "/{messageId}";

    String DELETE_MESSAGE = "/{messageId}";

    String DELIVERED_MESSAGE = "/{messageId}/delivered";

    String READ_MESSAGE = "/{messageId}/read";

    String REACTION_MESSAGE = "/{messageId}/reaction";

    /** Wildcard path matching all routes - used for security configurations */
    String FULL_PATH = "/**";
}
