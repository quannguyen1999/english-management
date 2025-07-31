package com.eng.controllers;

import com.eng.models.response.UserResponse;
import com.eng.service.GoogleOAuth2Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import static com.eng.constants.PathApi.*;

/**
 * Controller for handling Google OAuth2 authentication
 */
@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class GoogleOAuth2Controller {

    private final GoogleOAuth2Service googleOAuth2Service;

    /**
     * Get current authenticated user information
     * @param oauth2User The authenticated OAuth2 user
     * @return User information
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }
        
        log.info("Getting current user information for: {}", oauth2User.getName());
        UserResponse userResponse = googleOAuth2Service.extractUserInfo(oauth2User);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Process Google OAuth2 callback and create/update user
     * @param oauth2User The authenticated OAuth2 user
     * @return Processed user information
     */
    @PostMapping("/google/callback")
    public ResponseEntity<UserResponse> processGoogleCallback(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }
        
        log.info("Processing Google OAuth2 callback for user: {}", oauth2User.getName());
        UserResponse userResponse = googleOAuth2Service.processGoogleUser(oauth2User);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Get Google OAuth2 login URL
     * @return Redirect URL for Google OAuth2
     */
    @GetMapping("/google/login")
    public ResponseEntity<String> getGoogleLoginUrl() {
        String loginUrl = "http://localhost:8070" + GOOGLE_OAUTH_PATH;
        log.info("Google OAuth2 login URL: {}", loginUrl);
        return ResponseEntity.ok(loginUrl);
    }

    /**
     * OAuth2 success endpoint - this will be handled by the custom success handler
     * but we keep this for documentation purposes
     */
    @GetMapping("/oauth2/success")
    public ResponseEntity<String> oauth2Success() {
        return ResponseEntity.ok("OAuth2 authentication successful");
    }

    /**
     * Debug endpoint to show OAuth2 configuration
     */
    @GetMapping("/oauth2/debug")
    public ResponseEntity<String> oauth2Debug() {
        String redirectUri = "http://localhost:8070/login/oauth2/code/google";
        String authUrl = "http://localhost:8070/oauth2/authorization/google";
        
        String debugInfo = String.format(
            "OAuth2 Debug Info:\n" +
            "Authorization URL: %s\n" +
            "Redirect URI: %s\n" +
            "Make sure to add this exact redirect URI to Google OAuth2 console:\n" +
            "%s",
            authUrl, redirectUri, redirectUri
        );
        
        return ResponseEntity.ok(debugInfo);
    }

    /**
     * Test endpoint to check if application is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Application is running successfully!");
    }
} 