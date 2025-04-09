package com.eng.exceptions;

import com.eng.constants.MessageErrors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class representing Unauthorized (HTTP 501).
 * This exception is thrown when user don't have persmission.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedRequestException extends RuntimeException {

    public UnauthorizedRequestException(MessageErrors exception) {
        super(exception.toString());
    }

}