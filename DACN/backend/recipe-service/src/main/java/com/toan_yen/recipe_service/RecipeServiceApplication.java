package com.toan_yen.recipe_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient; // <-- THÊM IMPORT NÀY

@EnableDiscoveryClient // <-- THÊM ANNOTATION NÀY (Để thành "máy lẻ")
@SpringBootApplication
public class RecipeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecipeServiceApplication.class, args);
    }

}
