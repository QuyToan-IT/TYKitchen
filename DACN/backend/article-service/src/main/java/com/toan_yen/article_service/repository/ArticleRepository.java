package com.toan_yen.article_service.repository;

import com.toan_yen.article_service.entities.Article;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    // Tìm kiếm theo tiêu đề (đã có)
    List<Article> findByTitleContainingIgnoreCase(String query);

    // Tìm tất cả bài viết của một user
    List<Article> findByUserId(Long userId);

    // Tìm tất cả bài viết theo Tag (ManyToMany)
    List<Article> findByTags_Name(String tagName);

    // Tìm bài viết mới nhất
    List<Article> findTop5ByOrderByCreatedAtDesc();
}
