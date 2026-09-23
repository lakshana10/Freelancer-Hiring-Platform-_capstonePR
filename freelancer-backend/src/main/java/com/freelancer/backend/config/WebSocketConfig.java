package com.freelancer.backend.config;

import com.freelancer.backend.security.JwtService;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * Realtime project chat transport.
 *
 * - Handshake: GET /ws (SockJS fallback included for old browsers).
 * - App prefix: /app — clients SEND to /app/chat/{jobId}.
 * - Broker prefix: /topic — clients SUBSCRIBE to /topic/jobs/{jobId}.
 * - Auth: the JWT from HTTP login travels in the STOMP CONNECT
 *   "Authorization: Bearer ..." header (browsers cannot set HTTP
 *   headers on a websocket handshake, hence CONNECT-level auth).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;

    private final String allowedOrigins;

    public WebSocketConfig(
            JwtService jwtService,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.jwtService = jwtService;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        allowedOrigins.split(","))
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {

        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(
                    Message<?> message, MessageChannel channel) {

                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(
                                message, StompHeaderAccessor.class);

                if (accessor != null
                        && StompCommand.CONNECT.equals(
                                accessor.getCommand())) {

                    String header = firstHeader(
                            accessor, "Authorization");

                    if (header != null
                            && header.startsWith("Bearer ")) {

                        String token = header.substring(7).trim();

                        try {
                            JwtService.ParsedToken parsed =
                                    jwtService.parse(token);

                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            parsed.email(),
                                            null,
                                            List.of(() -> "ROLE_"
                                                    + parsed.role()));

                            accessor.setUser(auth);

                        } catch (JwtException
                                 | IllegalArgumentException e) {
                            // Leave unauthenticated; the chat
                            // controller rejects anonymous senders.
                        }
                    }
                }

                return message;
            }
        });
    }

    private String firstHeader(
            StompHeaderAccessor accessor, String name) {

        List<String> values = accessor.getNativeHeader(name);

        return (values == null || values.isEmpty())
                ? null
                : values.get(0);
    }
}
