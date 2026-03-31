package com.toan_yen.user_service.config;
import com.toan_yen.user_service.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
@Component
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        String email = authentication.getName(); // lấy email từ user đã login
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLoginAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            userRepository.save(user);
        });

        // Redirect hoặc trả về JSON tùy hệ thống
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("Đăng nhập thành công");
    }
}