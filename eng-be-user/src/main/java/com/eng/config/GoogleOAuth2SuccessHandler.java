package com.eng.config;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.OAuth2Token;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.eng.entities.User;
import com.eng.repositories.UserRepository;
import com.eng.service.impl.GoogleOAuth2ServiceImpl;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Custom OAuth2 success handler that generates JWT token and redirects to frontend
 */
@Slf4j
@Component
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    public final UserRepository userRepository;
    public final GoogleOAuth2ServiceImpl googleOAuth2Service;
    public final RSAKey rsaKey;
    public final OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator;
    public final OAuth2AuthorizationService authorizationService;
    public final RegisteredClientRepository registeredClientRepository;

    @Value("${custom-security.frontend}")
    protected String frontendUrl;

    public GoogleOAuth2SuccessHandler(
            UserRepository userRepository,
            GoogleOAuth2ServiceImpl googleOAuth2Service,
            RSAKey rsaKey,
            OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator,
            OAuth2AuthorizationService authorizationService,
            RegisteredClientRepository registeredClientRepository) {
        this.userRepository = userRepository;
        this.googleOAuth2Service = googleOAuth2Service;
        this.rsaKey = rsaKey;
        this.tokenGenerator = tokenGenerator;
        this.authorizationService = authorizationService;
        this.registeredClientRepository = registeredClientRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                      HttpServletResponse response, 
                                      Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        log.info("OAuth2 authentication successful for user: {}", oauth2User.getName());
        log.info("OAuth2 user attributes: {}", oauth2User.getAttributes());

        try {
            // Log the OAuth2 user details
            Map<String, Object> attributes = oauth2User.getAttributes();
            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            log.info("Processing OAuth2 user - Email: {}, Name: {}", email, name);
            
            // Process the Google user (create or update user in database)
            log.info("Calling googleOAuth2Service.processGoogleUser...");
            googleOAuth2Service.processGoogleUser(oauth2User);
            log.info("Successfully processed Google user");
            
            // Generate JWT token and refresh token
            log.info("Generating JWT token and refresh token...");
            String jwtToken = generateJwtToken(oauth2User);
            String refreshToken = generateRefreshToken(oauth2User, authentication);
            log.info("JWT token and refresh token generated successfully");
            
            // Redirect to frontend with both tokens
            String redirectUrl = frontendUrl + "/oauth2/success?token=" + jwtToken;
            if (refreshToken != null) {
                redirectUrl += "&refresh_token=" + refreshToken;
                redirectUrl += "&token_type=" + "Bearer";
                redirectUrl += "&expires_in=" + 3600;
            }
            log.info("Redirecting to: {}", redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            
        } catch (Exception e) {
            log.error("Error processing OAuth2 authentication success", e);
            log.error("Error details: {}", e.getMessage());
            log.error("Error stack trace:", e);
            String errorMessage = "Authentication failed: " + e.getMessage();
            String errorUrl = "http://localhost:3000/oauth2/error?message=" + java.net.URLEncoder.encode(errorMessage, "UTF-8");
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String generateJwtToken(OAuth2User oauth2User) throws JOSEException {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        
        // Find or create user to get user ID
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // This shouldn't happen as we process the user above, but just in case
            throw new RuntimeException("User not found after OAuth2 processing");
        }

        // Create JWT claims
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("http://localhost:8070")
                .audience("http://localhost:3000")
                .issueTime(Date.from(Instant.now()))
                .expirationTime(Date.from(Instant.now().plus(Duration.ofDays(1))))
                .jwtID(UUID.randomUUID().toString())
                .claim("authorities", Set.of(user.getRole().name()))
                .claim("user", user.getUsername())
                .claim("id", user.getId())
                .claim("email", user.getEmail())
                .build();

        // Sign the JWT
        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claimsSet);
        signedJWT.sign(new RSASSASigner(rsaKey.toPrivateKey()));

        return signedJWT.serialize();
    }

    private String generateRefreshToken(OAuth2User oauth2User, Authentication authentication) {
        try {
            Map<String, Object> attributes = oauth2User.getAttributes();
            String email = (String) attributes.get("email");
            
            // Find user to get user ID
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found after OAuth2 processing");
            }

            // Get a registered client (you might need to adjust this based on your client configuration)
            RegisteredClient registeredClient = registeredClientRepository.findByClientId("admin");
            if (registeredClient == null) {
                // Fallback to first available client
                // This is a simplified approach - you might want to configure this properly
                throw new RuntimeException("No registered client found for refresh token generation");
            }

            // Create token context for refresh token
            DefaultOAuth2TokenContext.Builder tokenContextBuilder = DefaultOAuth2TokenContext.builder()
                    .registeredClient(registeredClient)
                    .principal(authentication)
                    .authorizedScopes(Set.of("read", "write"))
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE);

            OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();
            OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
            
            if (!(generatedRefreshToken instanceof OAuth2RefreshToken)) {
                OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                        "The token generator failed to generate the refresh token.", "");
                throw new OAuth2AuthenticationException(error);
            }

            OAuth2RefreshToken refreshToken = (OAuth2RefreshToken) generatedRefreshToken;
            
            // Save the authorization with refresh token
            OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                    .principalName(user.getUsername())
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .authorizedScopes(Set.of("read", "write"))
                    .refreshToken(refreshToken);

            OAuth2Authorization authorization = authorizationBuilder.build();
            this.authorizationService.save(authorization);

            return refreshToken.getTokenValue();
            
        } catch (Exception e) {
            log.error("Error generating refresh token", e);
            // Return null if refresh token generation fails - the access token will still work
            return null;
        }
    }

    
} 