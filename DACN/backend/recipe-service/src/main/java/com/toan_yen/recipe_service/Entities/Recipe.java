package com.toan_yen.recipe_service.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String mainImageUrl;

    private String cookTime;
    private String servings;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime createdAt;
    
    // --- TRƯỜNG MỚI CHO TÍNH NĂNG DUYỆT BÀI ---
    
    /**
     * Trạng thái duyệt bài: PENDING (Chờ duyệt), ACCEPTED (Đã duyệt), REJECTED (Đã từ chối)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RecipeStatus status = RecipeStatus.PENDING; // Mặc định là PENDING

    /**
     * ID của Admin/Moderator đã thực hiện duyệt bài
     */
    @Column(name = "moderated_by_user_id")
    private Long moderatedByUserId;

    /**
     * Thời điểm bài được duyệt hoặc từ chối
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    /**
     * Lý do từ chối (chỉ điền khi status là REJECTED)
     */
    @Column(columnDefinition = "TEXT", name = "rejection_reason")
    private String rejectionReason;

    // --- RELATIONS ---

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Spice> spices = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Nutrition> nutritions = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("stepNumber ASC")
    @JsonManagedReference
    private List<Step> steps = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Image> images = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Recipe))
            return false;
        Recipe other = (Recipe) o;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}