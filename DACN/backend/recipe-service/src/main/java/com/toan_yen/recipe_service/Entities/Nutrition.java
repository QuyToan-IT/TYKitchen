package com.toan_yen.recipe_service.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "nutrition")
public class Nutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;  // ví dụ Calories, Protein
    private String value; // ví dụ "200 kcal", "10g"

@ManyToOne
@JoinColumn(name = "recipe_id")
@JsonBackReference
private Recipe recipe;
    // equals và hashCode chỉ dựa trên id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Nutrition)) return false;
        Nutrition other = (Nutrition) o;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
