package com.eng.service.impl;

import com.eng.constants.UserRole;
import com.eng.entities.User;
import com.eng.mappers.UserMapper;
import com.eng.models.response.UserResponse;
import com.eng.repositories.UserRepository;
import com.eng.service.GoogleOAuth2Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Implementation of Google OAuth2 service for handling Google authentication
 */
@Slf4j
@AllArgsConstructor
@Service
public class GoogleOAuth2ServiceImpl implements GoogleOAuth2Service {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse processGoogleUser(OAuth2User oauth2User) {
        log.info("Processing Google OAuth2 user: {}", oauth2User.getName());
        
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String googleId = (String) attributes.get("sub");
        
        // Check if user already exists
        User existingUser = userRepository.findByEmail(email);
        
        if (existingUser != null) {
            // Update existing user with Google information
            existingUser.setGoogleId(googleId);
            // Note: CommonBaseEntities fields are managed by the base class
            
            User savedUser = userRepository.save(existingUser);
            log.info("Updated existing user with Google OAuth2: {}", email);
            return userMapper.userToUserResponse(savedUser);
        } else {
            // Create new user from Google OAuth2
            User newUser = createUserFromGoogleOAuth2(oauth2User);
            User savedUser = userRepository.save(newUser);
            log.info("Created new user from Google OAuth2: {}", email);
            return userMapper.userToUserResponse(savedUser);
        }
    }

    @Override
    public UserResponse extractUserInfo(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        return UserResponse.builder()
                .email((String) attributes.get("email"))
                .firstName((String) attributes.get("given_name"))
                .lastName((String) attributes.get("family_name"))
                .fullName((String) attributes.get("name"))
                .picture((String) attributes.get("picture"))
                .googleId((String) attributes.get("sub"))
                .build();
    }

    private User createUserFromGoogleOAuth2(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        return User.builder()
                .email((String) attributes.get("email"))
                .username((String) attributes.get("email")) // Use email as username for Google users
                .firstName((String) attributes.get("given_name"))
                .lastName((String) attributes.get("family_name"))
                .fullName((String) attributes.get("name"))
                .picture((String) attributes.get("picture"))
                .googleId((String) attributes.get("sub"))
                .password(passwordEncoder.encode("Password@123"))
                .role(UserRole.USER)
                .isEmailVerified(true) // Google accounts are pre-verified
                .isActive(true)
                .role(UserRole.USER) // Default role for Google users
                .build();
    }
} 