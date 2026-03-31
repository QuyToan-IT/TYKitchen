package com.toan_yen.interaction_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor // <-- Sử dụng Lombok để inject dependency
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

    // ✅ Bỏ qua filter cho các request WebSocket handshake
    if (request.getServletPath().startsWith("/ws-chat")) {
        filterChain.doFilter(request, response);
        return;
    }
        final String userIdHeader = request.getHeader("x-user-id");
        final String userRoleHeader = request.getHeader("x-user-role");

        // Chỉ xử lý nếu có header và chưa có ai được xác thực
        if (userIdHeader != null && !userIdHeader.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Long userId = Long.parseLong(userIdHeader);
                // Mặc định là USER nếu không có header role
                String role = (userRoleHeader != null && !userRoleHeader.isEmpty()) ? userRoleHeader : "USER";

                // ✅ QUAN TRỌNG: Tạo quyền với tiền tố "ROLE_"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (NumberFormatException e) {
                // Bỏ qua nếu userId không phải là số, không làm gì cả
            }
        }

        filterChain.doFilter(request, response);
    }
}
