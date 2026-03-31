package com.toan_yen.interaction_service.repository;

import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // Tìm 1 đánh giá CỤ THỂ của 1 user (để Cập nhật hoặc Thêm mới)
    Optional<Rating> findByUserIdAndEntityIdAndEntityType(Long userId, Long entityId, EntityType entityType);

    // Dùng Câu lệnh Query (JPQL) để TÍNH ĐIỂM TRUNG BÌNH
    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.entityType = :entityType AND r.entityId = :entityId")
    Double findAverageStars(EntityType entityType, Long entityId);


    // Đếm xem có bao nhiêu lượt đánh giá
    long countByEntityTypeAndEntityId(EntityType entityType, Long entityId);
}