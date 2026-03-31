package com.toan_yen.interaction_service.dto;

import com.toan_yen.interaction_service.Entities.EntityType;
import lombok.Data;

// JSON gửi lên để TẠO/CẬP NHẬT đánh giá
@Data
public class RatingDTO {
    private Long userId;
    private Long entityId;
    private EntityType entityType;
    private int stars; // (1-5)
    
}
