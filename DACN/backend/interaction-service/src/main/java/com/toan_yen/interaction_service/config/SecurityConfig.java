package com.toan_yen.interaction_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Inject bộ lọc JWT (Bạn cần đảm bảo class này đã tồn tại trong project)
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Kích hoạt CORS từ WebConfig
            .csrf(csrf -> csrf.disable()) // Tắt CSRF
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không lưu session

            .authorizeHttpRequests(auth -> auth
                // Cho phép public cho WebSocket endpoint
                .requestMatchers("/ws-chat/**").permitAll()
                // ====================================================
                // 1. CẤU HÌNH CHO MODULE LIÊN HỆ (CONTACT)
                // ====================================================
                
                // Cho phép lấy danh sách loại yêu cầu (để hiện lên dropdown) -> PUBLIC
                .requestMatchers(HttpMethod.GET, "/api/v1/contacts/types").permitAll()
                
                // Cho phép GỬI liên hệ (Ai cũng gửi được) -> PUBLIC
                .requestMatchers(HttpMethod.POST, "/api/v1/contacts").permitAll()

                // Chỉ ADMIN mới được XEM danh sách và TRẢ LỜI
                .requestMatchers(HttpMethod.GET, "/api/v1/contacts").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/contacts/*/reply").hasRole("ADMIN")


                // ====================================================
                // 2. CẤU HÌNH CHO CÁC MODULE KHÁC (Cũ của bạn)
                // ====================================================
                
                // API công khai
                .requestMatchers(HttpMethod.GET, "/api/v1/comments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/ratings/stats").permitAll()
                .requestMatchers("/uploads/comments/**").permitAll()

                // API cần đăng nhập (USER hoặc ADMIN)
                .requestMatchers("/api/v1/comments/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/ratings/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/favorites/**").hasAnyRole("USER", "ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/v1/users/*/follow").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*/follow").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/*/is-following").permitAll()


                // ====================================================
                // 3. CHỐT CHẶN CUỐI CÙNG
                // ====================================================
                // Các request khác bắt buộc phải đăng nhập
                .anyRequest().authenticated()
            )      
            // Thêm bộ lọc JWT chạy trước bộ lọc gốc
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}