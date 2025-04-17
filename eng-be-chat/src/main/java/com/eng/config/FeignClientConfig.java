package com.eng.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Configuration class for Feign clients in the application.
 * 
 * This class provides configuration for Feign clients to:
 * - Automatically add JWT authentication tokens to outgoing requests
 * - Handle OAuth2 authentication for inter-service communication
 * 
 * The configuration ensures that all Feign client requests include the
 * necessary authentication token from the current security context.
 * 
 * @see org.springframework.cloud.openfeign.FeignClient
 * @see com.eng.feignClient.UserServiceClient
 * 
 * @author Prime Team
 * @version 1.0
 */
@Configuration
public class FeignClientConfig {

    /**
     * Creates a request interceptor that adds the JWT token to outgoing requests.
     * 
     * This interceptor:
     * - Extracts the JWT token from the current security context
     * - Adds the token to the Authorization header of outgoing requests
     * - Ensures proper format with "Bearer " prefix
     * 
     * @return A RequestInterceptor that adds JWT authentication to requests
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                String token = extractBearerToken();
                if (token != null) {
                    requestTemplate.header("Authorization", token);
                }
            }

            /**
             * Extracts the JWT token from the current security context.
             * 
             * @return The JWT token with "Bearer " prefix, or null if no token is available
             */
            private String extractBearerToken() {
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                    return "Bearer " + jwtAuth.getToken().getTokenValue();
                }
                return null;
            }
        };
    }
}

