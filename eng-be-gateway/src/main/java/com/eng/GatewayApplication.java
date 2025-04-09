package com.eng;

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

	/**
	 * Configures routing for the API Gateway.
	 * This method defines routes for user and project services using path-based routing.
	 *
	 * @param routeLocatorBuilder The route builder.
	 * @return Configured {@link RouteLocator}.
	 */
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
				.build();
	}

}
