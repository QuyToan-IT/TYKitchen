package com.toan_yen.recipe_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDTO {
    private String name;
    private String quantity;
}
