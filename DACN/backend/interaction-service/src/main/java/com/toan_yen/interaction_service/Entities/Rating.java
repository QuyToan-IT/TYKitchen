package com.toan_yen.interaction_service.Entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    // Đảm bảo 1 user CHỈ ĐƯỢC đánh giá 1 món ăn 1 LẦN
    @UniqueConstraint(columnNames = {"userId", "entityId", "entityType"})
})
@Data
@NoArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID của người đánh giá
    @Column(nullable = false)
    private Long userId;

    // ID của Món ăn / Bài viết
    @Column(nullable = false)
    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    // Số sao (1, 2, 3, 4, hoặc 5)
    @Column(nullable = false)
    private int stars;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
