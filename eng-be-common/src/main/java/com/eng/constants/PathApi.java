package com.eng.constants;

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

    /** Wildcard path matching all routes - used for security configurations */
    String FULL_PATH = "/**";
}
