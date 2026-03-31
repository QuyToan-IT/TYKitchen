package com.toan_yen.user_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt") // Đọc tất cả thuộc tính bắt đầu bằng "jwt"
public class JwtProperties {

    // jwt.secret-key → secretKey
    private String secretKey;

    // jwt.expiration-ms → expirationMs
    private long expirationMs;
}