package com.eng.entities;

import com.eng.constants.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "User")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class User extends CommonBaseEntities {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "char(36)")
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    private String username;

    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    // Google OAuth2 fields
    private String googleId;

    private String firstName;
    
    private String lastName;
    
    private String fullName;
    
    private String picture;
    
    private Boolean isEmailVerified = false;
    
    private Boolean isActive = true;
}
