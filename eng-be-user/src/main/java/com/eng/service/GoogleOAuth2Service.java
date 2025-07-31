package com.eng.service;

import com.eng.models.response.UserResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Service interface for Google OAuth2 authentication operations
 */
public interface GoogleOAuth2Service {
    
    /**
     * Process Google OAuth2 user information and create or update user
     * @param oauth2User The OAuth2 user information from Google
     * @return UserResponse containing user details
     */
    UserResponse processGoogleUser(OAuth2User oauth2User);
    
    /**
     * Extract user information from OAuth2 user
     * @param oauth2User The OAuth2 user information
     * @return UserResponse with extracted information
     */
    UserResponse extractUserInfo(OAuth2User oauth2User);
} 