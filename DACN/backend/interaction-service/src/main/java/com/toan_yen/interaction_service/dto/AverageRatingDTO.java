package com.toan_yen.interaction_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// JSON trả về cho frontend (hiển thị 4.5 sao (100 lượt))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AverageRatingDTO {
    private double averageRating; // Điểm trung bình (ví dụ: 4.5)
    private long ratingCount;   // Tổng số lượt đánh giá (ví dụ: 100)
}
