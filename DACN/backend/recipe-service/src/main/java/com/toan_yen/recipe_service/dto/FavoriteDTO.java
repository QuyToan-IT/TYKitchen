package com.toan_yen.recipe_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {
    private Long id; // ID của bản ghi Favorite
    private Long userId; // ID của người dùng đã yêu thích
    private RecipeDTO recipe; // Thông tin chi tiết của món ăn được yêu thích
}
