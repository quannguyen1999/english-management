package com.eng.constants;

/**
 * Constants for API paths used throughout the application
 */
public class PathApi {
    public static final String AUTHENTICATOR_PATH = "/authenticator";
    public static final String REGISTRATION_PATH = "/registration";
    public static final String GOOGLE_OAUTH_PATH = "/oauth2/authorization/google";
    public static final String GOOGLE_CALLBACK_PATH = "/login/oauth2/code/google";
    public static final String LOGIN_PATH = "/login";
    public static final String LOGOUT_PATH = "/logout";
    public static final String USER_PATH = "/users";
    public static final String USER = "/users";
    public static final String AUTHORIZE_PATH = "/oauth2/authorize";
    
    // User Management Endpoints
    public static final String USER_LIST_NAME = "/getListUserNames";
    public static final String USER_BY_UUID = "/uuid";
    public static final String USER_FIND_NAME = "/findUserByName";
    public static final String USER_CURRENT_PROFILE = "/current-profile";
} 