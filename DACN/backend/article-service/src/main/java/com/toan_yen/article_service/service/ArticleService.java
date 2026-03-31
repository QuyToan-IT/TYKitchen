package com.toan_yen.article_service.service;

import com.toan_yen.article_service.dto.CreateArticleRequest;
import com.toan_yen.article_service.entities.Article;
import com.toan_yen.article_service.entities.Tag;
import com.toan_yen.article_service.repository.ArticleRepository;
import com.toan_yen.article_service.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TagRepository tagRepository;

    @Value("${article.upload-dir}")
    private String uploadDir;

    // ==========================
    // 🛠 Helper methods
    // ==========================

    private void createUploadDirIfNotExist() {
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            if (!dir.mkdirs()) {
                log.error("Không thể tạo thư mục uploads: {}", uploadDir);
                throw new RuntimeException("Không thể tạo thư mục uploads: " + uploadDir);
            }
            log.info("Đã tạo thư mục uploads: {}", uploadDir);
        }
    }

    private String saveImage(MultipartFile imageFile) {
        try {
            createUploadDirIfNotExist();
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File f = new File(uploadDir, fileName);
            imageFile.transferTo(f);
            return fileName; // ✅ chỉ trả về tên file
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu ảnh", e);
        }
    }

    private Set<Tag> resolveTags(Set<Long> tagIds, Set<String> newTags) {
        Set<Tag> tags = new HashSet<>();

        // Tag có sẵn
        if (tagIds != null && !tagIds.isEmpty()) {
            tags.addAll(tagRepository.findAllByIdIn(tagIds));
        }

        // Tag mới
        if (newTags != null && !newTags.isEmpty()) {
            for (String tagName : newTags) {
                Tag existing = tagRepository.findByNameIgnoreCase(tagName);
                if (existing != null) {
                    tags.add(existing);
                } else {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    tags.add(tagRepository.save(newTag));
                }
            }
        }

        return tags;
    }

    // ==========================
    // 📝 CRUD cho Article
    // ==========================

    @Transactional
    public Article createArticle(CreateArticleRequest request, MultipartFile imageFile) {
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setUserId(request.getUserId()); // TODO: sau này lấy từ JWT

        // Upload ảnh
        if (imageFile != null && !imageFile.isEmpty()) {
            article.setThumbnailUrl(saveImage(imageFile)); // ✅ chỉ lưu tên file
        }

        // Gắn Tag
        article.setTags(resolveTags(request.getTagIds(), request.getNewTags()));

        return articleRepository.save(article);
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public List<Article> searchArticlesByTitle(String query) {
        return articleRepository.findByTitleContainingIgnoreCase(query);
    }

    @Transactional
    public Article updateArticle(Long id, CreateArticleRequest request, MultipartFile imageFile) {
        return articleRepository.findById(id).map(article -> {
            article.setTitle(request.getTitle());
            article.setSummary(request.getSummary());
            article.setContent(request.getContent());
            article.setUserId(request.getUserId());

            // Nếu có ảnh mới thì thay thế
            if (imageFile != null && !imageFile.isEmpty()) {
                article.setThumbnailUrl(saveImage(imageFile)); // ✅ chỉ lưu tên file
            }

            // Cập nhật Tag
            article.setTags(resolveTags(request.getTagIds(), request.getNewTags()));

            return articleRepository.save(article);
        }).orElseThrow(() -> new RuntimeException("Article not found"));
    }

    @Transactional
    public Article updateArticleImage(Long id, MultipartFile imageFile) {
        return articleRepository.findById(id).map(article -> {
            if (imageFile != null && !imageFile.isEmpty()) {
                article.setThumbnailUrl(saveImage(imageFile)); // ✅ chỉ lưu tên file
            }
            return articleRepository.save(article);
        }).orElseThrow(() -> new RuntimeException("Article not found"));
    }

    @Transactional
    public boolean deleteArticle(Long id) {
        return articleRepository.findById(id).map(article -> {
            articleRepository.delete(article);
            return true;
        }).orElse(false);
    }
}
