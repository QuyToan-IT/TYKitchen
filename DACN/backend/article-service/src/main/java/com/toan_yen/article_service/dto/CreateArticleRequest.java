package com.toan_yen.article_service.dto;

import lombok.Data;
import java.util.Set;

@Data
public class CreateArticleRequest {
    private String title;
    private String content;
    private String summary; 
    private Long userId;       // Tạm thời lấy từ request, sau này lấy từ JWT
    private Set<Long> tagIds;  // Danh sách ID của các Tag có sẵn

    // Chỉ lưu đường dẫn ảnh sau khi upload vào /upload
    private String thumbnailUrl;

    // Danh sách tên Tag mới do người dùng nhập
    private Set<String> newTags;
}
