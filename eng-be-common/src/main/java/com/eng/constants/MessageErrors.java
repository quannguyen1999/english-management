package com.eng.constants;

/**
 * Enumeration of all error messages used throughout the application.
 * These error messages are used for consistent error reporting and internationalization.
 * 
 * The errors are organized into categories:
 * - Authentication and Authorization errors
 * - Pagination errors
 * - User-related errors
 * - Task-related errors
 */
public enum MessageErrors {
    // Authentication and Authorization Errors
    /** General unauthorized access error */
    UNAUTHORIZED,
    /** Server-side error related to user operations */
    USER_SERVER_ERROR,
    /** User is not authorized to perform the action */
    USER_UNAUTHORIZED,
    /** Invalid username or password during authentication */
    ACCOUNT_USERNAME_OR_PASS_INVALID,

    // Pagination Errors
    /** Invalid page number in pagination request */
    PAGE_INVALID,
    /** Invalid page size in pagination request */
    SIZE_INVALID,

    // User-related Errors
    /** General user validation error */
    USER_INVALID,
    /** User does not exist in the system */
    USER_NOT_EXISTS,
    /** Invalid username format */
    USER_NAME_INVALID,
    /** Username not found in the system */
    USER_NAME_NOT_FOUND,
    /** Username already exists in the system */
    USER_NAME_EXISTS,
    /** Invalid password format or requirements not met */
    USER_PASSWORD_INVALID,
    /** Invalid email format */
    USER_EMAIL_INVALID,
    /** Email address already exists in the system */
    USER_EMAIL_EXISTS,
}
