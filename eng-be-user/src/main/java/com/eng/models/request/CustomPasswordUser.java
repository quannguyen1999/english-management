package com.eng.models.request;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

/**
 * Represents a custom password user with username, ID, and collection of authorities.
 */
public record CustomPasswordUser(String username, UUID id, Collection<GrantedAuthority> authorities) {

}
