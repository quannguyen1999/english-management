package com.eng.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Represents a standardized error response returned by the API.
 */
@Data
@AllArgsConstructor
public class ErrorResponse {

    /**
     * A brief message describing the error.
     */
    private String message;

    /**
     * A list containing detailed error descriptions.
     */
    private List<String> details;
}
