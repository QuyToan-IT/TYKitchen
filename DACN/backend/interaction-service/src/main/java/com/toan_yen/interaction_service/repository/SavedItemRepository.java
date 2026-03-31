package com.toan_yen.interaction_service.repository;

import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {

    // Lấy tất cả món ăn (RECIPE) đã lưu của 1 user
    List<SavedItem> findByUserIdAndEntityType(Long userId, EntityType entityType);

    // Tìm 1 món đã lưu (để kiểm tra hoặc xóa)
    Optional<SavedItem> findByUserIdAndEntityIdAndEntityType(Long userId, Long entityId, EntityType entityType);

    // Xóa trực tiếp một món đã lưu
    void deleteByUserIdAndEntityIdAndEntityType(Long userId, Long entityId, EntityType entityType);
}
