package com.eng.exceptions;


import com.eng.constants.MessageErrors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class representing a Bad Request (HTTP 400).
 * This exception is thrown when the request contains invalid or missing parameters.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(MessageErrors exception) {
        super(exception.toString());
    }

}