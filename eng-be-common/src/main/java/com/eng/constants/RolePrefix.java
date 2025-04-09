package com.eng.constants;

/**
 * Constants class for role-related prefixes and role names.
 * This class provides standardized role naming conventions used throughout the application.
 * 
 * The ROLE_PREFIX is used to maintain consistency with Spring Security's role naming convention,
 * where all roles should start with "ROLE_" prefix.
 */
public class RolePrefix {
    /**
     * Standard prefix used for all role names in the application.
     * This follows Spring Security's role naming convention.
     */
    public static final String ROLE_PREFIX = "ROLE_";

    /**
     * Complete role name for administrator users.
     * Combines the prefix with the ADMIN role from UserRole enum.
     */
    public static final String ADMIN = UserRole.ADMIN.toString();

    /**
     * Complete role name for regular users.
     * Combines the prefix with the USER role from UserRole enum.
     */
    public static final String USER = UserRole.USER.toString();
}
