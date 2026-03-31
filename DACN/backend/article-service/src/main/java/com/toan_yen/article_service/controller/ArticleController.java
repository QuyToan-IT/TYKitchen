package com.toan_yen.article_service.controller;

import com.toan_yen.article_service.dto.CreateArticleRequest;
import com.toan_yen.article_service.entities.Article;
import com.toan_yen.article_service.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    // 📝 Tạo bài viết mới (multipart: text + ảnh)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createArticle(
            @ModelAttribute CreateArticleRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Article createdArticle = articleService.createArticle(request, imageFile);
            return new ResponseEntity<>(createdArticle, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo bài viết: " + e.getMessage());
        }
    }

    // 📖 Lấy tất cả bài viết
    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles() {
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    // 📖 Lấy bài viết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        try {
            Article article = articleService.getArticleById(id);
            return ResponseEntity.ok(article);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy bài viết với ID: " + id);
        }
    }

    // 🔍 Tìm kiếm bài viết theo tiêu đề
    @GetMapping("/search")
    public ResponseEntity<List<Article>> searchArticles(@RequestParam("q") String query) {
        List<Article> articles = articleService.searchArticlesByTitle(query);
        return ResponseEntity.ok(articles);
    }

    // ✏️ Cập nhật bài viết (multipart: text + ảnh)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateArticle(
            @PathVariable Long id,
            @ModelAttribute CreateArticleRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Article updatedArticle = articleService.updateArticle(id, request, imageFile);
            return ResponseEntity.ok(updatedArticle);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy bài viết với ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật bài viết: " + e.getMessage());
        }
    }

    // 📷 Cập nhật ảnh riêng cho bài viết
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) {
        try {
            Article updated = articleService.updateArticleImage(id, imageFile);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy bài viết với ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật ảnh: " + e.getMessage());
        }
    }

    // 🗑️ Xóa bài viết
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        boolean deleted = articleService.deleteArticle(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy bài viết với ID: " + id);
        }
        return ResponseEntity.noContent().build();
    }
}
