package com.eng.exceptions;

import com.eng.constants.MessageErrors;
import com.eng.models.response.ErrorResponse;
import feign.FeignException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler for handling application-wide exceptions.
 * This class ensures consistent error responses for various types of exceptions.
 */
@Slf4j
@SuppressWarnings({"unchecked", "rawtypes"})
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Handles Feign client exceptions.
     * If the status is 400 (Bad Request), it throws an UnauthorizedRequestException.
     *
     * @param e        The FeignException thrown by the client.
     * @param response The HTTP response.
     * @return A string indicating a Feign error.
     */
    @ExceptionHandler(FeignException.class)
    public String handleFeignStatusException(FeignException e, HttpServletResponse response) {
        if (e.status() == HttpStatus.BAD_REQUEST.value()) {
            throw new UnauthorizedRequestException(MessageErrors.ACCOUNT_USERNAME_OR_PASS_INVALID);
        }
        return "feignError";
    }

    /**
     * Handles all generic exceptions that are not explicitly caught.
     * Returns a 500 Internal Server Error response.
     *
     * @param ex The exception thrown.
     * @return A structured error response.
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public final ResponseEntity<Object> handleAllExceptions(Exception ex) {
        log.debug(ex.getLocalizedMessage());
        ex.printStackTrace();
        return commonHandlerException(Strings.EMPTY, "Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles BadRequestException (HTTP 400).
     *
     * @param ex The BadRequestException thrown.
     * @return A structured error response.
     */
    @ExceptionHandler(BadRequestException.class)
    @ResponseBody
    public final ResponseEntity<Object> handleBadRequest(Exception ex) {
        return commonHandlerException(ex.getLocalizedMessage(), "Bad Request", HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles NotFoundException (HTTP 404).
     *
     * @param ex The NotFoundException thrown.
     * @return A structured error response.
     */
    @ExceptionHandler(NotFoundException.class)
    @ResponseBody
    public final ResponseEntity<Object> handleUserNotFoundException(NotFoundException ex) {
        return commonHandlerException(ex.getLocalizedMessage(), "Not Found", HttpStatus.NOT_FOUND);
    }

    /**
     * Handles UnauthorizedRequestException (HTTP 401).
     *
     * @param ex The UnauthorizedRequestException thrown.
     * @return A structured error response.
     */
    @ExceptionHandler(UnauthorizedRequestException.class)
    @ResponseBody
    public final ResponseEntity<Object> handleUnauthorizedRequestException(UnauthorizedRequestException ex) {
        return commonHandlerException(ex.getLocalizedMessage(), "Unauthorized Request", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Generates a standardized error response for exceptions.
     *
     * @param exMessage  The exception message.
     * @param message    A user-friendly error message.
     * @param httpStatus The HTTP status code.
     * @return A structured error response wrapped in a ResponseEntity.
     */
    private ResponseEntity<Object> commonHandlerException(String exMessage, String message, HttpStatus httpStatus) {
        List<String> details = new ArrayList<>();
        details.add(exMessage); // Add error details
        ErrorResponse error = new ErrorResponse(message, details);
        return new ResponseEntity(error, httpStatus);
    }
}
