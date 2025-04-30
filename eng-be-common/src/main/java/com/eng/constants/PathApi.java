package com.eng.constants;

/**
 * Interface defining all API endpoint paths used throughout the application.
 * This centralizes all API route definitions to maintain consistency and make updates easier.
 * <p>
 * The paths are organized by feature area:
 * - User management endpoints
 * - Authentication and authorization endpoints
 */
public interface PathApi {
    /**
     * Wildcard path matching all routes - used for security configurations
     */
    String FULL_PATH = "/**";

    // Authentication and Authorization Endpoints
    /**
     * Path for authentication operations
     */
    String AUTHENTICATOR_PATH = "/authenticator";
    /**
     * Path for OAuth2 authorization
     */
    String AUTHORIZE_PATH = "/oauth2/authorize";
    /**
     * Path for user registration
     */
    String REGISTRATION_PATH = "/registration";

    // User Management Endpoints
    /**
     * Base path for all user-related operations
     */
    String USER = "/users";
    /**
     * Path for retrieving a list of user names
     */
    String USER_LIST_NAME = "/getListUserNames";
    /**
     * Path for finding a user by their name
     */
    String USER_FIND_NAME = "/findUserByName";

    String USER_CURRENT_PROFILE = "/current-profile";

    // Conversation Management Endpoints
    /**
     * Base path for all conversation-related operations
     */
    String CONVERSATION = "/conversations";

    String CONVERSATION_PRIVATE = "/private";

    String CONVERSATION_LOAD_FRIEND = "/load-friend";

    String CONVERSATION_FRIEND_ALL = "/friend-all";

    String CONVERSATION_CURRENT_PROFILE = "/current-profile";

    String CONVERSATION_GROUP = "/group";

    // Message Management Endpoints
    /**
     * Base path for all message-related operations
     */
    String MESSAGE = "/messages";

    String MESSAGE_DELIVERED = "/delivered";

    String MESSAGE_READ = "/read";

    String MESSAGE_REACTION = "/reaction";

    // Friend Management Endpoints
    /**
     * Base path for all friend-related operations
     */
    String FRIEND = "/friends";

    String FRIEND_SEND = "/send";
    
    String FRIEND_ACCEPT = "/accept";

    String FRIEND_REJECT = "/reject";

    String FRIEND_REQUEST_PENDING = "/pending";
}
