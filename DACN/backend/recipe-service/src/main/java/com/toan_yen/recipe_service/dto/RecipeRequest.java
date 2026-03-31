package com.toan_yen.recipe_service.dto;

import java.util.List;

public class RecipeRequest {
    private String title;          // có thể null
    private String description;    // có thể null
    private List<String> steps;    // có thể null hoặc rỗng

    // Getter & Setter
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

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
