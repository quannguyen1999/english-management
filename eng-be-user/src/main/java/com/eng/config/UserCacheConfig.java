package com.eng.config;

import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for user-related caching.
 * Extends CachingConfigurerSupport to provide custom cache configuration.
 * 
 * Defines two main cache names:
 * - USER_CACHE: For caching paginated user lists
 * - USER_DETAILS_CACHE: For caching individual user details and user name lookups
 */
@Configuration
@EnableCaching
public class UserCacheConfig extends CachingConfigurerSupport {

    /**
     * Cache name for storing paginated user lists.
     * Used by listUser method in UserImpl.
     */
    public static final String USER_CACHE = "users";

    /**
     * Cache name for storing paginated user lists by UUID.
     */
    public static final String USER_UUID_CACHE = "usersId";

    /**
     * Cache name for storing individual user details and user name lookups.
     * Used by:
     * - findUserByUsername in UserImpl
     * - getListUserNames in UserImpl
     * - loadUserByUsername in UserDetailConfigService
     */
    public static final String USER_DETAILS_CACHE = "userDetails";

    /**
     * Custom key generator for cache entries.
     * Creates a unique key by combining:
     * - Target class name
     * - Method name
     * - Parameter values
     * 
     * @return KeyGenerator implementation
     */
    @Bean
    public KeyGenerator userKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getName());
            sb.append(method.getName());
            for (Object param : params) {
                if (param != null) {
                    sb.append(param.toString());
                }
            }
            return sb.toString();
        };
    }
} 