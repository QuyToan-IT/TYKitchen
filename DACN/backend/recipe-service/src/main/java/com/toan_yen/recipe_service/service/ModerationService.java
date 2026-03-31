package com.toan_yen.recipe_service.service;

import com.toan_yen.recipe_service.Entities.Recipe;
import com.toan_yen.recipe_service.Entities.RecipeStatus;
import com.toan_yen.recipe_service.repository.RecipeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class ModerationService {

    private final RecipeRepository recipeRepository;
    private final GeminiService geminiService;

    // Sử dụng @Lazy để tránh lỗi Circular Dependency nếu có
    public ModerationService(RecipeRepository recipeRepository, @Lazy GeminiService geminiService) {
        this.recipeRepository = recipeRepository;
        this.geminiService = geminiService;
    }

    // Sửa lại: Lấy bài viết theo một trạng thái cụ thể
    public List<Recipe> getRecipesByStatus(RecipeStatus status) {
        return recipeRepository.findAllByStatusOrderByCreatedAtDesc(status);
    }

    // Thêm mới: Lấy tất cả bài viết cho trang kiểm duyệt
    public List<Recipe> getAllRecipesForModeration() {
        return recipeRepository.findAllByOrderByCreatedAtDesc();
    }

    // ✅ THÊM MỚI: Lấy một Recipe theo ID để kiểm duyệt
    public Recipe getRecipeById(Long recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công thức với ID: " + recipeId));
    }

    /**
     * PHƯƠNG THỨC MỚI: Tự động kiểm duyệt công thức bằng AI một cách bất đồng bộ.
     * Annotation @Async sẽ chạy phương thức này trên một luồng riêng.
     * ID của admin hệ thống (ví dụ: 0) sẽ được dùng cho các tác vụ tự động.
     */
    @Async
    @Transactional
    public void autoModerateRecipe(Long recipeId) {
        final Long SYSTEM_ADMIN_ID = 0L; // ID đại diện cho hệ thống tự động
        log.info("Bắt đầu tự động kiểm duyệt cho công thức ID: {}", recipeId);
        try {
            Thread.sleep(1000); // Đợi một chút để đảm bảo transaction của việc tạo recipe đã commit

            Recipe recipe = getRecipeById(recipeId);
            if (recipe.getStatus() != RecipeStatus.PENDING) {
                log.warn("Công thức ID: {} không ở trạng thái PENDING, bỏ qua tự động kiểm duyệt.", recipeId);
                return;
            }

            String geminiResponse = geminiService.reviewRecipeContent(recipe);

            if (geminiResponse.startsWith("APPROVED")) {
                acceptRecipe(recipeId, SYSTEM_ADMIN_ID);
            } else if (geminiResponse.startsWith("REJECTED:")) {
                String reason = geminiResponse.substring("REJECTED:".length()).trim();
                rejectRecipe(recipeId, SYSTEM_ADMIN_ID, reason);
            }
        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng trong quá trình tự động kiểm duyệt cho ID {}: {}", recipeId, e.getMessage());
        }
    }

    @Transactional
    public void acceptRecipe(Long recipeId, Long adminUserId) {
        if (recipeId == null || adminUserId == null) {
            throw new IllegalArgumentException("Recipe ID và Admin User ID không được để trống.");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        if (recipe.getStatus() != RecipeStatus.PENDING) {
            throw new IllegalStateException("Recipe đã được duyệt/từ chối trước đó.");
        }

        recipe.setStatus(RecipeStatus.APPROVED);
        recipe.setModeratedByUserId(adminUserId);
        recipe.setModeratedAt(LocalDateTime.now());
        recipe.setRejectionReason(null); // Clear reason nếu có
        recipeRepository.save(recipe);
    }

    @Transactional
    public void rejectRecipe(Long recipeId, Long adminUserId, String reason) {
        if (recipeId == null || adminUserId == null) {
            throw new IllegalArgumentException("Recipe ID và Admin User ID không được để trống.");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        if (recipe.getStatus() != RecipeStatus.PENDING) {
            throw new IllegalStateException("Recipe đã được duyệt/từ chối trước đó.");
        }

        recipe.setStatus(RecipeStatus.REJECTED);
        recipe.setRejectionReason(reason);
        recipe.setModeratedByUserId(adminUserId);
        recipe.setModeratedAt(LocalDateTime.now());
        recipeRepository.save(recipe);
    }
}