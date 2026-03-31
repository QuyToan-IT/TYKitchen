package com.toan_yen.article_service.repository;

import com.toan_yen.article_service.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Set;

public interface TagRepository extends JpaRepository<Tag, Long> {

    // Tìm các Tag dựa trên danh sách ID
    List<Tag> findAllByIdIn(Set<Long> ids);

    // Tìm Tag theo tên (tránh trùng lặp khi tạo mới)
    Tag findByNameIgnoreCase(String name);

    // Kiểm tra tồn tại Tag theo tên
    boolean existsByNameIgnoreCase(String name);

    // Lấy tất cả Tag có tên chứa từ khóa
    List<Tag> findByNameContainingIgnoreCase(String keyword);
}
