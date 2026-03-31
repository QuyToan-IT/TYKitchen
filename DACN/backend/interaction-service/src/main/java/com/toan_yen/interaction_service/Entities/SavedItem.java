package com.toan_yen.interaction_service.Entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_items", uniqueConstraints = {
    // Đảm bảo 1 user không thể "lưu" 1 món ăn 2 lần
    @UniqueConstraint(columnNames = {"userId", "entityId", "entityType"})
})
@Data
@NoArgsConstructor
public class SavedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID của người lưu (từ user-service)
    @Column(nullable = false)
    private Long userId;

    // ID của thứ được lưu (ID của Recipe hoặc Article)
    @Column(nullable = false)
    private Long entityId;

    // Loại (RECIPE hay ARTICLE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    @Column(updatable = false)
    private LocalDateTime savedAt;

    @PrePersist
    protected void onCreate() {
        this.savedAt = LocalDateTime.now();
    }
}
