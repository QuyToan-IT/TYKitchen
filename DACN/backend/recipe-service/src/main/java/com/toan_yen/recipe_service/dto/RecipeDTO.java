package com.toan_yen.recipe_service.dto;

import com.toan_yen.recipe_service.Entities.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class RecipeDTO {

    private Long id;
    private String title;
    private String description;
    private String cookTime;
    private String servings;
    private Difficulty difficulty;

    private Long userId;
    private String creatorName;     // Tên người tạo (set từ Service)
    private String creatorEmail;    // Email người tạo (set từ Service)
    private String createdAt;       // Thời gian tạo định dạng giờ VN

    private Long categoryId;
    private String categoryName;

    private List<String> ingredients;
    private List<String> spices;
    private List<String> nutritions;
    private List<String> steps;

    private String mainImageUrl;
    private List<String> imageUrls;

    // --- TRƯỜNG MỚI CHO DUYỆT BÀI ---
    private RecipeStatus status;             // Trạng thái duyệt bài (PENDING, ACCEPTED, REJECTED)
    private String rejectionReason;          // Lý do từ chối (Chỉ có khi status là REJECTED)
    private Long moderatedByUserId;          // ID Admin đã duyệt/từ chối
    private String moderatedAt;              // Thời điểm duyệt/từ chối (đã định dạng)
    // ----------------------------------


    /**
     * Constructor này chỉ được sử dụng để map dữ liệu nội bộ từ Entity.
     * Logic gọi Microservice (fetchUserInfo) đã được chuyển sang RecipeService.convertToDTO().
     * Dữ liệu creatorName/creatorEmail phải được set sau khi gọi constructor này.
     */
    public RecipeDTO(Recipe recipe) {
        this.id = recipe.getId();
        this.title = recipe.getTitle();
        this.description = recipe.getDescription();
        this.cookTime = recipe.getCookTime();
        this.servings = recipe.getServings();
        this.difficulty = recipe.getDifficulty();

        this.userId = recipe.getUserId();
        this.createdAt = formatVNTime(recipe.getCreatedAt());

        // GÁN THÔNG TIN DUYỆT BÀI TỪ ENTITY
        this.status = recipe.getStatus();
        this.rejectionReason = recipe.getRejectionReason();
        this.moderatedByUserId = recipe.getModeratedByUserId();
        this.moderatedAt = formatVNTime(recipe.getModeratedAt());

        // Category
        if (recipe.getCategory() != null) {
            this.categoryId = recipe.getCategory().getId();
            this.categoryName = recipe.getCategory().getName();
        }

        // Ingredients
        this.ingredients = recipe.getIngredients().stream()
                .map(i -> {
                    String quantity = i.getQuantity() != null ? i.getQuantity() : "";
                    String name = i.getName() != null ? i.getName() : "";
                    return (quantity + " " + name).trim();
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());

        // Spices
        this.spices = recipe.getSpices().stream()
                .map(s -> {
                    String quantity = s.getQuantity() != null ? s.getQuantity() : "";
                    String name = s.getName() != null ? s.getName() : "";
                    return (quantity + " " + name).trim();
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());

        // Nutritions
        this.nutritions = recipe.getNutritions().stream()
                .map(n -> {
                    String name = n.getName() != null ? n.getName() : "";
                    String value = n.getValue() != null ? n.getValue() : "";
                    return (name + (value.isEmpty() ? "" : ": " + value)).trim();
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());

        // Steps
        this.steps = recipe.getSteps().stream()
                .map(Step::getInstruction)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toList());

        // Images
        this.mainImageUrl = recipe.getMainImageUrl();
        this.imageUrls = recipe.getImages().stream()
                .map(Image::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .collect(Collectors.toList());
    }

    private String formatVNTime(java.time.LocalDateTime time) {
        if (time == null) return null;
        return time.atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    /**
     * UserDTO chỉ dùng để nhận dữ liệu từ user-service
     */
    @Data
    public static class UserDTO {
        private Long id;
        private String fullName;
        private String email;
    }
}