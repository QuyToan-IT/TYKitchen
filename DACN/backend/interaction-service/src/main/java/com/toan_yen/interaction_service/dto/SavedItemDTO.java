package com.toan_yen.interaction_service.dto;

import com.toan_yen.interaction_service.Entities.EntityType;
import lombok.Data;

// JSON gửi lên để LƯU một món
@Data
public class SavedItemDTO {
    private Long userId;
    private Long entityId;
    private EntityType entityType;
}
