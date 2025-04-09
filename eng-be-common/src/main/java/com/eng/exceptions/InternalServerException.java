package com.eng.exceptions;

/**
 * Exception class representing a Internal Server Error (HTTP 500).
 * This exception is thrown when the server crash.
 */
public class InternalServerException extends RuntimeException {

    public InternalServerException(String exception) {
        super(exception);
    }
}