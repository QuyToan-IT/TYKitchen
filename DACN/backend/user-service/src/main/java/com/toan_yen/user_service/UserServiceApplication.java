package com.toan_yen.user_service;

import com.toan_yen.user_service.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableDiscoveryClient
@EnableConfigurationProperties(JwtProperties.class)   // ⭐ BẮT BUỘC
@SpringBootApplication
// Thêm annotation này để kích hoạt Spring Data JPA và chỉ định nơi tìm repository
@EnableJpaRepositories(basePackages = "com.toan_yen.user_service.repository")
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
