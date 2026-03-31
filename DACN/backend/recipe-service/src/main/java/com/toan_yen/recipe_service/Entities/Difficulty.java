package com.toan_yen.recipe_service.Entities;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Difficulty {
    EASY("Dễ"),
    MEDIUM("Trung bình"),
    HARD("Khó");

    private final String label;

    Difficulty(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Difficulty fromValue(String value) {
        for (Difficulty d : Difficulty.values()) {
            if (d.name().equalsIgnoreCase(value) || d.label.equalsIgnoreCase(value)) {
                return d;
            }
        }
        throw new IllegalArgumentException("Không tìm thấy Difficulty với giá trị: " + value);
    }
}
