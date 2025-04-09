
package com.eng.config.grantpassword;

import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

import java.util.Map;

/**
 * Extends OAuth2ClientAuthenticationToken to support custom password grant type
 * client authentication.
 */
public class CustomPasswordOAuth2ClientAuthenticationToken extends OAuth2ClientAuthenticationToken {

    public CustomPasswordOAuth2ClientAuthenticationToken(String clientId,
                                                         ClientAuthenticationMethod clientAuthenticationMethod, Object credentials,
                                                         Map<String, Object> additionalParameters) {
        super(clientId, clientAuthenticationMethod, credentials, additionalParameters);
    }

    public CustomPasswordOAuth2ClientAuthenticationToken(RegisteredClient registeredClient,
                                                         ClientAuthenticationMethod clientAuthenticationMethod, Object credentials) {
        super(registeredClient, clientAuthenticationMethod, credentials);
    }
}
