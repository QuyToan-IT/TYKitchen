package com.toan_yen.recipe_service.controller;

import com.toan_yen.recipe_service.Entities.Recipe;
import com.toan_yen.recipe_service.Entities.RecipeStatus;
import com.toan_yen.recipe_service.dto.RecipeDTO; // Giả sử bạn có RecipeDTO cho hiển thị
import com.toan_yen.recipe_service.service.GeminiService;
import com.toan_yen.recipe_service.service.ModerationService;
import com.toan_yen.recipe_service.service.RecipeService; // Để dùng convertToDTO

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/moderation") // Sửa: Chuẩn hóa đường dẫn API
@RequiredArgsConstructor
@Slf4j
public class ModerationController {

    private final ModerationService moderationService;
    private final RecipeService recipeService;
    private final GeminiService geminiService;

    // Lấy danh sách bài viết theo trạng thái (PENDING, APPROVED, REJECTED) hoặc lấy tất cả
    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getRecipes(
            @RequestParam(required = false) RecipeStatus status,
            @RequestHeader(value = "Authorization", required = false) String token) {

        log.info("GET /api/v1/moderation?status={}", status);

        List<Recipe> recipes;
        if (status != null) {
            // Nếu có status, lọc theo status
            recipes = moderationService.getRecipesByStatus(status);
        } else {
            // Nếu không có status, lấy tất cả
            recipes = moderationService.getAllRecipesForModeration();
        }

        List<RecipeDTO> dtos = recipes.stream()
                .map(recipe -> recipeService.convertToDTO(recipe, token))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Cập nhật trạng thái của một công thức (Duyệt hoặc Từ chối)
    @PatchMapping("/{recipeId}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateRecipeStatus(
            @PathVariable Long recipeId,
            @RequestBody StatusUpdateRequest request,
            @RequestHeader("x-user-id") Long adminUserId) { // Lấy ID Admin từ Gateway

        log.info("PATCH /api/v1/moderation/{}/status - Admin {} cập nhật trạng thái thành {}", recipeId, adminUserId, request.getStatus());

        if (request.getStatus() == RecipeStatus.APPROVED) {
            moderationService.acceptRecipe(recipeId, adminUserId);
        } else if (request.getStatus() == RecipeStatus.REJECTED) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new IllegalArgumentException("Lý do từ chối không được để trống.");
            }
            moderationService.rejectRecipe(recipeId, adminUserId, request.getReason());
        } else {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
        }
    }
}

// DTO đơn giản để nhận trạng thái và lý do từ chối
@Getter
@Setter
class StatusUpdateRequest {
    private RecipeStatus status;
    private String reason;
}