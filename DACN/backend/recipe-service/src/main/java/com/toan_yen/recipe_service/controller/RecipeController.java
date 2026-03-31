package com.toan_yen.recipe_service.controller;

import com.toan_yen.recipe_service.dto.RecipeDTO;
import com.toan_yen.recipe_service.service.RecipeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recipes")
@Slf4j
public class RecipeController {

    private final RecipeService recipeService;
    
    // Lưu ý: Đảm bảo bạn đã có ModerationController (riêng) cho các API Admin.

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    // =========================================================================
    // 1. CÁC API CẦN XÁC THỰC (BẮT BUỘC TOKEN)
    // =========================================================================

    // ✅ Tạo recipe mới với JSON + file upload
    @PostMapping
    public ResponseEntity<RecipeDTO> createRecipe(
            @RequestPart("dto") RecipeDTO dto,
            @RequestPart(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestPart(value = "otherImages", required = false) List<MultipartFile> otherImages,
            @RequestHeader("Authorization") String token) throws IOException { 

        log.info("POST /api/v1/recipes (tạo mới)");
        RecipeDTO created = recipeService.createRecipe(dto, mainImage, otherImages, token);
        return ResponseEntity.ok(created);
    }

    // ✅ Cập nhật recipe theo id
    @PutMapping("/{id}")
    public ResponseEntity<RecipeDTO> updateRecipe(
            @PathVariable Long id,
            @RequestBody RecipeDTO dto,
            @RequestHeader("Authorization") String token) { 

        log.info("PUT /api/v1/recipes/{}", id);
        RecipeDTO updated = recipeService.updateRecipe(id, dto, token);
        return ResponseEntity.ok(updated);
    }

    // ✅ Upload ảnh đại diện cho recipe
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile,
            @RequestHeader("Authorization") String token) throws IOException { // ĐÃ THÊM BẮT BUỘC TOKEN

        log.info("POST /api/v1/recipes/{}/upload-image", id);
        String filename = recipeService.uploadMainImage(id, imageFile);
        return ResponseEntity.ok(Map.of("mainImageUrl", filename));
    }

    // ✅ Xóa recipe theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) { 

        log.info("DELETE /api/v1/recipes/{}", id);
        recipeService.deleteRecipe(id, token); // ĐÃ SỬA: Truyền token vào Service
        return ResponseEntity.noContent().build();
    }


    // =========================================================================
    // 2. CÁC API CÔNG KHAI (TOKEN TÙY CHỌN - required = false)
    // =========================================================================

    // ✅ Lấy danh sách recipe theo filter
@GetMapping
public ResponseEntity<List<RecipeDTO>> filterRecipes(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String creator,
        @RequestParam(required = false) String time,
        @RequestParam(required = false) String difficulty,
        @RequestParam(required = false, defaultValue = "desc") String sort,
        @RequestHeader(value = "Authorization", required = false) String token) {

    log.info("GET /api/v1/recipes?creator={}&sort={}", creator, sort);

    // ✅ Nếu creator=me → lấy user hiện tại từ token
    if ("me".equals(creator)) {
        List<RecipeDTO> myRecipes = recipeService.getRecipesByCurrentUser(token);
        return ResponseEntity.ok(myRecipes);
    }

    // ✅ Ưu tiên lọc theo categoryId nếu có (hiệu quả hơn)
    // Frontend đang gửi categoryId qua param `category`
    try {
        if (category != null && !category.isBlank()) {
            Long categoryId = Long.parseLong(category);
            log.info("GET /api/v1/recipes?categoryId={}", categoryId);
            List<RecipeDTO> recipes = recipeService.getRecipesByCategoryId(categoryId, token);
            return ResponseEntity.ok(recipes);
        }
    } catch (NumberFormatException e) {
        // Nếu không phải ID, sẽ fallback về filter theo tên bên dưới
    }

    // ✅ Nếu creator khác hoặc không có → dùng filter bình thường
    List<RecipeDTO> recipes = recipeService.filterRecipes(category, search, time, difficulty, sort, token);
    return ResponseEntity.ok(recipes);
}



    // ✅ Lấy recipe theo id
    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getRecipeById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) { // TOKEN TÙY CHỌN

        log.info("GET /api/v1/recipes/{}", id);
        RecipeDTO recipe = recipeService.getRecipeById(id, token);
        return ResponseEntity.ok(recipe);
    }

    // ✅ Lấy recipe mới nhất theo danh mục
    @GetMapping("/latest")
    public ResponseEntity<RecipeDTO> getLatestRecipeByCategory(
        @RequestParam String category,
        @RequestHeader(value = "Authorization", required = false) String token) { // TOKEN TÙY CHỌN

    log.info("GET /api/v1/recipes/latest?category={}", category);
    RecipeDTO latestRecipe = recipeService.getLatestRecipeByCategory(category, token);
    return ResponseEntity.ok(latestRecipe);
}

}