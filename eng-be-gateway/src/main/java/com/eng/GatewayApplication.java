package com.eng;

//import com.eng.config.GatewayConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

/**
 * API Gateway Application using Spring Cloud Gateway.
 * Routes requests to appropriate microservices.
 */
@SpringBootApplication
public class GatewayApplication {

	private static final Logger logger = LoggerFactory.getLogger(GatewayApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}
	
	@Bean
	public RouteLocator routeConfig(RouteLocatorBuilder routeLocatorBuilder) {
		return routeLocatorBuilder.routes()
				// Route for User Service
				.route(p -> p
						.path("/user-service/**")
						.filters(f -> f
								.rewritePath("/user-service/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
								.retry(3)
						)
						.uri("lb://ENG-USER-SERVICE"))

				// Route for Project Service
				.route(p -> p
						.path("/chat-service/**")
						.filters(f -> f
								.rewritePath("/chat-service/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
								.retry(3)
						)
						.uri("lb://ENG-CHAT-SERVICE"))
				.build();
//		return routeLocatorBuilder.routes()
//				// Route for User Service
//				.route(p -> p
//						.path(getFullPath(gatewayConfig.getUserService().getPath()))
//						.filters(f -> f
//								.rewritePath(
//										getSegment(gatewayConfig.getUserService().getPath()),
//										REWRITE_REPLACEMENT
//								)
//								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
//								.retry(gatewayConfig.getRetry().getMaxAttempts())
//						)
//						.uri("lb://" + gatewayConfig.getUserService().getServiceId()))
//				.route(p -> p
//						.path(getFullPath(gatewayConfig.getChatService().getPath()))
//						.filters(f -> f
//								.rewritePath(
//										getSegment(gatewayConfig.getChatService().getPath()),
//										REWRITE_REPLACEMENT
//								)
//								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
//								.retry(gatewayConfig.getRetry().getMaxAttempts())
//						)
//						.uri("lb://" + gatewayConfig.getChatService().getServiceId()))
//				.build();
	}

	private static String getFullPath(String path) {
		return path + "/**";
	}

	private static String REWRITE_REPLACEMENT = "/${segment}";

	private static String getSegment(String path) {
		return path + "/(?<segment>.*)";
	}

}
