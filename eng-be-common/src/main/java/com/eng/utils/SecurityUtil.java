package com.eng.utils;

import com.eng.constants.MessageErrors;
import com.eng.constants.RolePrefix;
import com.eng.constants.UserRole;
import com.eng.exceptions.UnauthorizedRequestException;
import lombok.experimental.UtilityClass;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.UUID;

@UtilityClass
public class SecurityUtil {

    public Object getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getPrincipal() : null;
    }

    public Object getDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getDetails() : null;
    }

    public Object getCredentials() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getCredentials() : null;
    }

    public UUID getIDUser() {
        String id = getValueByKey("id");
        if (id == null) {
            throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
        }
        return UUID.fromString(id);
    }

    public String getUserName() {
        String username = getValueByKey("user");
        if (username == null) {
            throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
        }
        return username;
    }

    public Boolean isAdmin() {
        List<String> authorities = getAuthorities();
        if (authorities == null || authorities.isEmpty()) {
            return false;
        }
        return authorities.parallelStream()
                .anyMatch(t -> RolePrefix.ADMIN.equalsIgnoreCase(t) || 
                             (RolePrefix.ROLE_PREFIX + UserRole.ADMIN.toString()).equalsIgnoreCase(t));
    }

    public List<String> getAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuthToken) {
            Object value = jwtAuthToken.getTokenAttributes().get("authorities");
            if (value instanceof List<?> list) {
                return list.stream().map(Object::toString).toList();
            }
        }

        throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
    }

    private String getValueByKey(String key) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuthToken) {
            Object value = jwtAuthToken.getTokenAttributes().get(key);
            return !ObjectUtils.isEmpty(value) ? value.toString() : null;
        }

        throw new UnauthorizedRequestException(MessageErrors.UNAUTHORIZED);
    }
}
