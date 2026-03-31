package com.toan_yen.discovery_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

// === ANNOTATION QUAN TRỌNG NHẤT ===
@EnableEurekaServer // Biến ứng dụng này thành "Tổng đài"
// ===================================
@SpringBootApplication
public class DiscoveryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }

}