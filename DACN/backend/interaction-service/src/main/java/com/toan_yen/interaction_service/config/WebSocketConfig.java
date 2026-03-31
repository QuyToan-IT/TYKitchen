package com.toan_yen.interaction_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private AuthChannelInterceptor authChannelInterceptor;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Kênh broker đơn giản cho broadcast và queue riêng
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix client gửi lên server
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix user đích (dùng cho convertAndSendToUser)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint khớp frontend: http://localhost:8888/ws-chat
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Thêm endpoint Raw WebSocket cho client stompjs (không dùng SockJS)
        registry.addEndpoint("/ws-chat/raw")
                .setAllowedOriginPatterns("*");
    }
}
