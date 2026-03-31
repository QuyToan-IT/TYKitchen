package com.toan_yen.recipe_service.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "steps")
public class Step {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer stepNumber;

    @Column(columnDefinition = "TEXT")
    private String instruction; // ✅ đổi lại từ description → instruction

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    @JsonBackReference
    private Recipe recipe;

    // Không override equals/hashCode theo id nữa
    // để tránh lỗi khi id=null lúc tạo mới
}
