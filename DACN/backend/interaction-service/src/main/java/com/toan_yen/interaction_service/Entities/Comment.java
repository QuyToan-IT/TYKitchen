package com.toan_yen.interaction_service.Entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID của người bình luận (từ user-service)
    @Column(nullable = false)
    private Long userId;

    // ID của thứ được bình luận (ID của Recipe hoặc Article)
    @Column(nullable = false)
    private Long entityId;

    // Loại (RECIPE hay ARTICLE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Nội dung bình luận

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ----- Thông tin người dùng (Lấy từ user-service) -----
    // Service này chỉ lưu lại thông tin user lúc bình luận
    // để tránh phải gọi API user-service mỗi khi lấy bình luận
    
    @Column(nullable = false)
    private String userFullName; // Ví dụ: "Luu Thi Kim Yen"

    private String userAvatarUrl; // Ví dụ: "avatar.jpg"
    // ✅ Quan hệ reply
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "parent_id")
    private Comment parent;   // comment cha
    
     @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Comment> replies = new ArrayList<>(); // danh sách reply

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CommentImage> images = new ArrayList<>();


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
