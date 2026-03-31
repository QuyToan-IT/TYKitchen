package com.toan_yen.recipe_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync; // 👈 import thêm
import org.springframework.web.client.RestTemplate;

/**
 * Cấu hình chung cho ứng dụng
 */
@Configuration
@EnableAsync   // 👈 bật hỗ trợ @Async ở đây
public class AppConfig {

    /**
     * Khai báo RestTemplate để gọi sang các service khác (ví dụ user-service).
     * Spring sẽ quản lý bean này, bạn chỉ cần @Autowired ở service.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
