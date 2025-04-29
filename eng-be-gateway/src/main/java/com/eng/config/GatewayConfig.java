package com.eng.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "gateway")
public class GatewayConfig {
    private ServiceConfig userService;
    private ServiceConfig chatService;
    private RetryConfig retry;

    @Data
    public static class ServiceConfig {
        private String path;
        private String serviceId;
    }

    @Data
    public static class RetryConfig {
        private int maxAttempts;
    }
}