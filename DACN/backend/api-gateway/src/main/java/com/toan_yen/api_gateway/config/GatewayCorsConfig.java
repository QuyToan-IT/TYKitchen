package com.toan_yen.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class GatewayCorsConfig {

    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ SỬA: Thêm cả http và https (nếu cần)
        // Frontend dev thường chạy ở http://localhost:5173
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "https://localhost:5173" 
        ));

        // Cấu hình các phần khác
        config.addAllowedMethod("*");       // GET, POST, PUT, DELETE, OPTIONS...
        config.addAllowedHeader("*");       // Authorization, Content-Type...
        config.setAllowCredentials(true);   // Cho phép gửi cookie/token
        
        // Thiết lập thời gian cache cho pre-flight request (OPTIONS) để giảm tải
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}