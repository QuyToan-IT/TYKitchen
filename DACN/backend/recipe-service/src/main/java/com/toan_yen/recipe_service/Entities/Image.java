package com.toan_yen.recipe_service.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;  // đường dẫn ảnh trong /upload

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    // equals và hashCode chỉ dựa trên id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Image)) return false;
        Image other = (Image) o;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
