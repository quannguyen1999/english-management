package com.eng.controllers;


import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;

import static com.eng.constants.PathApi.AUTHENTICATOR_PATH;
import static com.eng.constants.PathApi.REGISTRATION_PATH;

/**
 * Handles user authentication and registration processes.
 * Manages security context and session for authenticated users.
 */
@AllArgsConstructor
@Controller
public class LoginController {
    // Repository for managing security context in HTTP sessions
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // Handler for successful authentication
    private final AuthenticationSuccessHandler authenticationSuccessHandler;

    /**
     * Validates registration code and authenticates user.
     * Redirects to success handler upon successful validation.
     */
    @PostMapping(REGISTRATION_PATH)
    public void validateRegistration(@RequestParam("code") String code,
                                     HttpServletRequest request,
                                     HttpServletResponse response,
                                     @CurrentSecurityContext SecurityContext context) throws ServletException, IOException {
        this.authenticationSuccessHandler.onAuthenticationSuccess(request, response, getAuthentication(request, response));
    }

    /**
     * Returns the authenticator view for user authentication.
     */
    @GetMapping(AUTHENTICATOR_PATH)
    public String authenticator(@CurrentSecurityContext SecurityContext context) {
        return "authenticator";
    }

    /**
     * Validates authentication code and processes user login.
     * Redirects to success handler upon successful validation.
     */
    @PostMapping(AUTHENTICATOR_PATH)
    public void validateCode(
            @RequestParam("code") String code,
            HttpServletRequest request,
            HttpServletResponse response,
            @CurrentSecurityContext SecurityContext context) throws ServletException, IOException {
        this.authenticationSuccessHandler.onAuthenticationSuccess(request, response, getAuthentication(request, response));
    }

    /**
     * Retrieves and saves the current security context.
     * Ensures authentication state is properly maintained in the session.
     */
    private Authentication getAuthentication(
            HttpServletRequest request,
            HttpServletResponse response) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(securityContext.getAuthentication());
        SecurityContextHolder.setContext(securityContext);
        securityContextRepository.saveContext(securityContext, request, response);
        return securityContext.getAuthentication();
    }

}
