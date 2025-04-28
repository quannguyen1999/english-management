package com.eng.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Jackson JSON processing in the application.
 * 
 * This class configures the ObjectMapper to:
 * - Handle Hibernate lazy loading properly
 * - Prevent serialization failures on empty beans
 * - Support Jakarta EE (formerly Java EE) annotations
 * 
 * The configuration ensures proper JSON serialization of:
 * - Hibernate entities with lazy-loaded relationships
 * - Complex object graphs
 * - Empty or null values
 * 
 * @see com.fasterxml.jackson.databind.ObjectMapper
 * @see com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule
 * 
 * @author Prime Team
 * @version 1.0
 */
@Configuration
public class JacksonConfig {

    /**
     * Creates and configures a custom ObjectMapper for JSON processing.
     * 
     * The configured ObjectMapper:
     * - Registers the Hibernate5JakartaModule for proper Hibernate entity handling
     * - Disables lazy loading to prevent serialization issues
     * - Configures serialization features for better JSON output
     * 
     * @return A configured ObjectMapper instance
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Prevent serialization failures on lazy-loaded properties
        Hibernate5JakartaModule hibernateModule = new Hibernate5JakartaModule();
        // Configure hibernate module to ignore lazy loading aspect
        hibernateModule.configure(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING, false);
        
        mapper.registerModule(hibernateModule);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        mapper.registerModule(new JavaTimeModule());
        
        return mapper;
    }
} 