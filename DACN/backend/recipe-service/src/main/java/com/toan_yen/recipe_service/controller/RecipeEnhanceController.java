package com.toan_yen.recipe_service.controller;

import com.toan_yen.recipe_service.service.RecipeEnhanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/recipes")
@Validated
public class RecipeEnhanceController {

    private final RecipeEnhanceService recipeEnhanceService;

    public RecipeEnhanceController(RecipeEnhanceService recipeEnhanceService) {
        this.recipeEnhanceService = recipeEnhanceService;
    }

    /** ✨ Endpoint duy nhất: gợi ý mô tả món ăn */
    @PostMapping("/enhance/description")
    public ResponseEntity<?> enhanceDescription(@RequestBody Map<String, Object> payload) {
        String description = payload.get("description") instanceof String d ? d : null;

        // Nếu mô tả trống thì báo lỗi
        if (isBlank(description)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập mô tả để AI gợi ý"));
        }

        Map<String, Object> enhanced = recipeEnhanceService.enhanceDescription(description);
        return ResponseEntity.ok(enhanced);
    }

    // 🔧 Hàm tiện ích kiểm tra null/empty
    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
