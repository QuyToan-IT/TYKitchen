package com.toan_yen.interaction_service.repository;

import com.toan_yen.interaction_service.Entities.Comment;
import com.toan_yen.interaction_service.Entities.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Lấy tất cả bình luận của 1 món ăn (hoặc bài viết)
    // Sắp xếp theo ngày tạo mới nhất (DESC)
    List<Comment> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(EntityType entityType, Long entityId);
    List<Comment> findByEntityTypeAndEntityIdAndParentIsNullOrderByCreatedAtDesc(EntityType entityType, Long entityId);

}
