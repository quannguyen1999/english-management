package com.eng.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Interceptor for WebSocket handshake requests to handle authentication.
 * 
 * This interceptor:
 * - Validates authentication tokens during WebSocket connection establishment
 * - Extracts tokens from request parameters
 * - Stores tokens in WebSocket session attributes for later use
 * 
 * The interceptor works with the WebSocketConfig to ensure secure
 * WebSocket connections with proper authentication.
 * 
 * @see com.prime.config.WebSocketConfig
 * @see org.springframework.web.socket.server.HandshakeInterceptor
 * 
 * @author Prime Team
 * @version 1.0
 */
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    /**
     * Processes the WebSocket handshake request before the connection is established.
     * 
     * This method:
     * - Extracts the authentication token from request parameters
     * - Validates the token presence
     * - Stores the token in session attributes if valid
     * 
     * @param request The WebSocket handshake request
     * @param response The WebSocket handshake response
     * @param wsHandler The WebSocket handler
     * @param attributes The session attributes map
     * @return true if the handshake should proceed, false otherwise
     * @throws Exception if an error occurs during handshake processing
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");
            if (token != null && !token.isEmpty()) {
                attributes.put("token", token);
                return true;
            }
        }
        return false;
    }

    /**
     * Processes the WebSocket handshake after the connection is established.
     * 
     * This method is called after the handshake is complete and can be used
     * for cleanup or additional processing. In this implementation, no
     * additional processing is required.
     * 
     * @param request The WebSocket handshake request
     * @param response The WebSocket handshake response
     * @param wsHandler The WebSocket handler
     * @param exception Any exception that occurred during the handshake
     */
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                             WebSocketHandler wsHandler, Exception exception) {
        // No action needed after handshake
    }
} 