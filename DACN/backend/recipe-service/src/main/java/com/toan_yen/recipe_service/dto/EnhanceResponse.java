package com.toan_yen.recipe_service.dto;

import java.util.List;

public class EnhanceResponse {
    private String description;       // gợi ý mô tả
    private List<String> steps;       // gợi ý các bước nấu ăn

    // Getter & Setter
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSteps() {
        return steps;
    }
    public void setSteps(List<String> steps) {
        this.steps = steps;
    }
}
