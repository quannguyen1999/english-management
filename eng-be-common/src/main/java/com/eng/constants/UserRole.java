package com.eng.constants;

/**
 * Enumeration defining the available user roles in the application.
 * This enum is used for role-based access control (RBAC) throughout the system.
 * 
 * The roles are used in conjunction with Spring Security to control access to
 * different parts of the application and determine user permissions.
 */
public enum UserRole {
    /**
     * Administrator role with full system access.
     * Users with this role can:
     * - Manage all users
     * - Access all projects and tasks
     * - Modify system settings
     * - View system-wide statistics
     */
    ADMIN,

    /**
     * Standard user role with limited access.
     * Users with this role can:
     * - View and manage their own tasks
     * - Access projects they are assigned to
     * - Update their own profile
     */
    USER
}
