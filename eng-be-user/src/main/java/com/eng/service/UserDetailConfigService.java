package com.eng.service;

import com.eng.config.UserCacheConfig;
import com.eng.entities.User;
import com.eng.models.request.CustomUserDetails;
import com.eng.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;

/**
 * Service for loading user details during authentication.
 * Implements Spring Security's UserDetailsService to provide user information for authentication.
 * Uses Redis caching to improve authentication performance by caching user details.
 */
@RequiredArgsConstructor
@Service
public class UserDetailConfigService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads user details by username for authentication.
     * Results are cached using the username as the key to improve performance
     * for frequent authentication requests for the same user.
     * 
     * Cache eviction is handled by the UserImpl service when user details are updated.
     * 
     * @param username The username to load details for
     * @return UserDetails object containing user information
     * @throws UsernameNotFoundException if the user is not found
     */
    @Transactional
    @Override
    @Cacheable(value = UserCacheConfig.USER_DETAILS_CACHE, key = "#username")
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (ObjectUtils.isEmpty(user)) {
            throw new UsernameNotFoundException("Access Denied " + username);
        }
        return new CustomUserDetails(new User(user.getId(), user.getUsername(), user.getEmail(), user.getPassword(), user.getRole(), user.getGoogleId(), user.getFirstName(), user.getLastName(), user.getFullName(), user.getPicture(), user.getIsEmailVerified(), user.getIsActive()));
    }

}
