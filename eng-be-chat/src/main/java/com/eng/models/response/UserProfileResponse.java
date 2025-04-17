package com.eng.models.response;

import lombok.Data;

import java.util.UUID;

@Data
public class UserProfileResponse {
    private UUID id;

    private String username;
}
