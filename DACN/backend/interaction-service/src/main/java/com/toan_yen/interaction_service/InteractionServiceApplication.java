package com.toan_yen.interaction_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient; // <-- THÊM IMPORT NÀY

@EnableDiscoveryClient // <-- THÊM ANNOTATION NÀY (Để thành "máy lẻ")
@SpringBootApplication
public class InteractionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InteractionServiceApplication.class, args);
    }

}
