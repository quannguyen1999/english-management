
package com.eng.config.grantpassword;

import com.eng.entities.User;
import com.eng.models.request.CustomPasswordUser;
import com.eng.repositories.UserRepository;
import org.apache.logging.log4j.util.Strings;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder;
import org.springframework.security.oauth2.server.authorization.token.*;
import org.springframework.util.Assert;
import org.springframework.util.ObjectUtils;

import java.security.Principal;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Handles custom password grant type authentication by validating user credentials
 * and generating OAuth2 access and refresh tokens.
 */
public class CustomPassordAuthenticationProvider implements AuthenticationProvider {

    private final OAuth2AuthorizationService authorizationService;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator;
    private final OAuth2TokenCustomizer<JwtEncodingContext> oAuth2TokenCustomizer;
    private String username = "";
    private String password = "";
    private Set<String> authorizedScopes = new HashSet<>();

    public CustomPassordAuthenticationProvider(OAuth2AuthorizationService authorizationService,
                                               OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator,
                                               UserRepository userRepository,
                                               PasswordEncoder passwordEncoder,
                                               OAuth2TokenCustomizer<JwtEncodingContext> oAuth2TokenCustomizer
    ) {

        Assert.notNull(authorizationService, "authorizationService cannot be null");
        Assert.notNull(tokenGenerator, "TokenGenerator cannot be null");
        Assert.notNull(userRepository, "userRepository cannot be null");
        this.authorizationService = authorizationService;
        this.tokenGenerator = tokenGenerator;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.oAuth2TokenCustomizer = oAuth2TokenCustomizer;

    }

    private static OAuth2ClientAuthenticationToken getAuthenticatedClientElseThrowInvalidClient(Authentication authentication) {
        OAuth2ClientAuthenticationToken clientPrincipal = null;
        if (OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication.getPrincipal().getClass())) {
            clientPrincipal = (OAuth2ClientAuthenticationToken) authentication.getPrincipal();
        }
        if (clientPrincipal != null && clientPrincipal.isAuthenticated()) {
            return clientPrincipal;
        }
        Object reslt = authentication.getPrincipal();
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        CustomPasswordAuthenticationToken customPasswordAuthenticationToken = (CustomPasswordAuthenticationToken) authentication;
        OAuth2ClientAuthenticationToken clientPrincipal = getAuthenticatedClientElseThrowInvalidClient(customPasswordAuthenticationToken);
        RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();
        username = customPasswordAuthenticationToken.getUsername();
        password = customPasswordAuthenticationToken.getPassword();
        User user = userRepository.findByUsername(username);
        try {
            if (ObjectUtils.isEmpty(user)) {
                throw new UsernameNotFoundException("Access Denied " + username);
            }
        } catch (UsernameNotFoundException e) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.ACCESS_DENIED);
        }

        if (!passwordEncoder.matches(password, user.getPassword()) || !user.getUsername().equalsIgnoreCase(username)) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.ACCESS_DENIED);
        }
        Collection<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(user.getRole().toString()));
        authorizedScopes = authorities.stream()
                .map(scope -> scope.getAuthority())
                .filter(scope -> registeredClient.getScopes().contains(scope))
                .collect(Collectors.toSet());

        //-----------Create a new Security Context Holder Context----------
        OAuth2ClientAuthenticationToken oAuth2ClientAuthenticationToken = (OAuth2ClientAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        CustomPasswordUser customPasswordUser = new CustomPasswordUser(username, user.getId(), authorities);
        oAuth2ClientAuthenticationToken.setDetails(customPasswordUser);

        var newcontext = SecurityContextHolder.createEmptyContext();
        newcontext.setAuthentication(oAuth2ClientAuthenticationToken);
        SecurityContextHolder.setContext(newcontext);

        //-----------TOKEN BUILDERS----------
        DefaultOAuth2TokenContext.Builder tokenContextBuilder = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(clientPrincipal)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizedScopes(authorizedScopes)
                .authorizationGrantType(new AuthorizationGrantType("custom_password"))
                .authorizationGrant(customPasswordAuthenticationToken);

        OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                .attribute(Principal.class.getName(), clientPrincipal)
                .principalName(clientPrincipal.getName())
                .authorizationGrantType(new AuthorizationGrantType("custom_password"))
                .authorizedScopes(authorizedScopes);


        //-----------ACCESS TOKEN----------
        OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.ACCESS_TOKEN).build();
        OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
        if (generatedAccessToken == null) {
            OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                    "The token generator failed to generate the access token.", Strings.EMPTY);
            throw new OAuth2AuthenticationException(error);
        }

        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
                generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),
                generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());
        if (generatedAccessToken instanceof ClaimAccessor) {
            authorizationBuilder.token(accessToken, (metadata) ->
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims()));
        } else {
            authorizationBuilder.accessToken(accessToken);
        }

        //-----------REFRESH TOKEN----------
        OAuth2RefreshToken refreshToken = null;
        if (registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN) &&
                !clientPrincipal.getClientAuthenticationMethod().equals(ClientAuthenticationMethod.NONE)) {

            tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();
            OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
            if (!(generatedRefreshToken instanceof OAuth2RefreshToken)) {
                OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                        "The token generator failed to generate the refresh token.", Strings.EMPTY);
                throw new OAuth2AuthenticationException(error);
            }
            refreshToken = (OAuth2RefreshToken) generatedRefreshToken;
            authorizationBuilder.refreshToken(refreshToken);
        }

        OAuth2Authorization authorization = authorizationBuilder.build();
        this.authorizationService.save(authorization);

        return new OAuth2AccessTokenAuthenticationToken(registeredClient, clientPrincipal, accessToken, refreshToken);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return CustomPasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

}
