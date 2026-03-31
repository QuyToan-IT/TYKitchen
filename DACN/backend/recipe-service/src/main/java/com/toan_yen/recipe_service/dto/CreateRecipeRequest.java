package com.toan_yen.recipe_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecipeRequest {
    private String title;
    private String description;
    private String imageUrl;
    private String videoUrl;
    private String cookTime;
    private String servings;
    private Long userId;
    private Set<Long> categoryIds;
    private List<IngredientDTO> ingredients;
    private List<StepDTO> steps;
}
