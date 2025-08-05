package com.eng.models.response;

import com.eng.constants.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;

    private String username;

    private String email;

    private UserRole role;
    
    // Google OAuth2 fields
    private String googleId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String picture;
    private Boolean isEmailVerified;
    private Boolean isActive;
    
    // Timestamp fields
    private Date createdAt;
    private Date updatedAt;
}
