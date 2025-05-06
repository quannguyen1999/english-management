package com.eng.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.util.Map;

/**
 * Configuration class for WebSocket and STOMP messaging in the application.
 *
 * This class configures:
 * - WebSocket endpoints and message brokers
 * - STOMP protocol support
 * - Message size limits and timeouts
 * - Authentication and authorization for WebSocket connections
 * - CORS and origin policies
 *
 * The configuration enables real-time communication between clients and the server
 * using WebSocket and STOMP protocols, with proper security measures in place.
 *
 * @see org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
 * @see org.springframework.messaging.simp.config.MessageBrokerRegistry
 *
 * @author Prime Team
 * @version 1.0
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;

    @Value("${spring.websocket.allowed-origins}")
    private String allowedOrigins;

    public WebSocketConfig(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    /**
     * Configures the message broker for STOMP messaging.
     *
     * This method:
     * - Enables a simple in-memory message broker
     * - Sets up destination prefixes for message routing
     * - Configures application destination prefixes
     *
     * @param config The MessageBrokerRegistry to configure
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        log.info("Configuring message broker");
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registers STOMP endpoints and configures handshake handling.
     *
     * This method:
     * - Registers the WebSocket endpoint
     * - Configures allowed origins and patterns
     * - Sets up handshake interceptors
     * - Configures custom handshake handler
     *
     * @param registry The StompEndpointRegistry to configure
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering STOMP endpoints with allowed origins: {}", allowedOrigins);
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins)
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   org.springframework.web.socket.WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        log.info("Before handshake - Headers: {}", request.getHeaders());
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               org.springframework.web.socket.WebSocketHandler wsHandler, Exception exception) {
                        if (exception != null) {
                            log.error("Handshake error: {}", exception.getMessage(), exception);
                        } else {
                            log.info("Handshake successful");
                        }
                    }
                })
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected boolean isWebSocketVersionSupported(WebSocketHttpHeaders headers) {
                        log.info("Checking WebSocket version with headers: {}", headers);
                        return super.isWebSocketVersionSupported(headers);
                    }
                });
    }

    /**
     * Configures WebSocket transport settings.
     *
     * This method:
     * - Sets message size limits
     * - Configures send buffer size
     * - Sets send time limits
     *
     * @param registration The WebSocketTransportRegistration to configure
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        log.info("Configuring WebSocket transport");
        registration.setMessageSizeLimit(8192) // 8KB
                .setSendBufferSizeLimit(512 * 1024) // 512KB
                .setSendTimeLimit(20000); // 20 seconds
    }

    /**
     * Configures the client inbound channel with authentication.
     *
     * This method:
     * - Adds authentication interceptor
     * - Processes JWT tokens
     * - Sets up security context
     *
     * @param registration The ChannelRegistration to configure
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        log.info("Configuring client inbound channel");
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, org.springframework.messaging.MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (accessor.getCommand() != null) {
                    log.info("Received STOMP command: {}", accessor.getCommand().name());
                    log.info("Message headers: {}", accessor.toMap());

                    if (accessor.getCommand().name().equals("CONNECT")) {
                        String token = accessor.getFirstNativeHeader("Authorization");
                        log.info("Processing CONNECT message with token: {}", token != null ? "present" : "missing");

                        if (token != null && token.startsWith("Bearer ")) {
                            token = token.substring(7);
                            try {
                                log.info("Attempting to decode JWT token");
                                Jwt jwt = jwtDecoder.decode(token);
                                log.info("Successfully decoded JWT token for user: {}", jwt.getSubject());
                                log.info("JWT claims: {}", jwt.getClaims());

                                Authentication auth = new JwtAuthenticationToken(jwt);
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                log.info("Authentication set successfully for user: {}", jwt.getSubject());
                                accessor.setUser(auth);
                            } catch (Exception e) {
                                log.error("Error validating JWT token: {}", e.getMessage(), e);
                                return null;
                            }
                        } else {
                            log.warn("No valid token provided in CONNECT message");
                            return null;
                        }
                    }
                }

                return message;
            }

            @Override
            public void afterSendCompletion(org.springframework.messaging.Message<?> message, org.springframework.messaging.MessageChannel channel, boolean sent, Exception ex) {
                if (ex != null) {
                    log.error("Error during message send: {}", ex.getMessage(), ex);
                }
            }
        });
    }
} 