package com.toan_yen.interaction_service.dto;

import com.toan_yen.interaction_service.Entities.EntityType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
// JSON gửi lên để TẠO bình luận
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long userId;
    private Long entityId;
    private EntityType entityType;
    private String content;

    // Thông tin người dùng (lấy từ JWT token)
    private String userFullName;
    private String userAvatarUrl;

    private List<String> imageUrls;
}
