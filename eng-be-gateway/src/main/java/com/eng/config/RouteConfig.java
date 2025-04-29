package com.eng.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

import static com.eng.constant.NameConstant.*;

@Configuration
public class RouteConfig {
    @Autowired
    private GatewayConfig gatewayConfig;

    @Bean
    public RouteLocator configRoute(RouteLocatorBuilder routeLocatorBuilder) {
        return routeLocatorBuilder.routes()
                // Route for User Service
                .route(p -> p
                        .path(getFullPath(gatewayConfig.getUserService().getPath()))
                        .filters(f -> f
                                .rewritePath(
                                        getSegment(gatewayConfig.getUserService().getPath()),
                                        REWRITE_REPLACEMENT
                                )
                                .addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
                                .retry(gatewayConfig.getRetry().getMaxAttempts())
                        )
                        .uri("lb://" + gatewayConfig.getUserService().getServiceId()))
                .route(p -> p
                        .path(getFullPath(gatewayConfig.getChatService().getPath()))
                        .filters(f -> f
                                .rewritePath(
                                        getSegment(gatewayConfig.getChatService().getPath()),
                                        REWRITE_REPLACEMENT
                                )
                                .addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
                                .retry(gatewayConfig.getRetry().getMaxAttempts())
                        )
                        .uri("lb://" + gatewayConfig.getChatService().getServiceId()))
                .build();
    }

}
