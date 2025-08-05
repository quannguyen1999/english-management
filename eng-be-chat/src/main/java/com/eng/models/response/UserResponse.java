package com.eng.models.response;

import com.eng.constants.UserRole;
import com.eng.models.response.CommonBaseResponse;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse extends CommonBaseResponse {

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

}
