package com.toan_yen.interaction_service.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Collections;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // ✅ Xử lý cả CONNECT và STOMP (STOMP 1.2 dùng lệnh STOMP thay vì CONNECT)
        if (StompCommand.CONNECT.equals(accessor.getCommand()) ||
            StompCommand.STOMP.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");

            if (token != null && token.startsWith("Bearer ")) {
                try {
                    String jwt = token.substring(7);

                    // Decode payload (phần giữa của JWT)
                    String[] parts = jwt.split("\\.");
                    if (parts.length == 3) {
                        String payload = new String(Base64.getDecoder().decode(parts[1]));
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(payload);

                        Long userId = node.get("userId").asLong();
                        String role = node.has("role") ? node.get("role").asText() : "USER";

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    accessor.setUser(auth); // gắn user vào session WebSocket
                    }
                } catch (Exception e) {
                    // Nếu token không hợp lệ, có thể reject hoặc cho anonymous
                    SecurityContextHolder.clearContext();
                }
            }
        }

        return message;
    }
}
