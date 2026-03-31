package com.toan_yen.interaction_service.service;

import com.toan_yen.interaction_service.dto.CommentDTO;
import com.toan_yen.interaction_service.dto.SavedItemDTO;
import com.toan_yen.interaction_service.Entities.Comment;
import com.toan_yen.interaction_service.Entities.CommentImage;
import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.SavedItem;
import com.toan_yen.interaction_service.repository.CommentRepository;
import com.toan_yen.interaction_service.repository.SavedItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionService {

    private final CommentRepository commentRepository;
    private final SavedItemRepository savedItemRepository;

    // ✅ Khai báo uploadDir lấy từ application.properties
    @Value("${comment.upload-dir}")
    private String uploadDir;

    // ✅ Hàm tạo thư mục nếu chưa có
    private void createUploadDirIfNotExist() {
        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            log.error("Không thể tạo thư mục uploads: {}", uploadDir);
            throw new RuntimeException("Không thể tạo thư mục uploads: " + uploadDir);
        }
    }

    // === Logic cho Bình luận (Comment) ===

// === Logic cho Bình luận (Comment) ===
public List<Comment> getCommentsForEntity(EntityType entityType, Long entityId) {
    // Chỉ lấy comment cha (parent = null)
    List<Comment> parentComments = commentRepository
        .findByEntityTypeAndEntityIdAndParentIsNullOrderByCreatedAtDesc(entityType, entityId);

    // Ép Hibernate/JPA load replies (tránh lazy load khi serialize JSON)
    parentComments.forEach(comment -> {
        comment.getReplies().size(); // gọi để đảm bảo replies được fetch
        comment.getImages().size();  // gọi để đảm bảo images được fetch
    });

    return parentComments;
}

    

    public Comment createComment(CommentDTO dto) {
        Comment comment = new Comment();
        comment.setUserId(dto.getUserId());
        comment.setEntityId(dto.getEntityId());
        comment.setEntityType(dto.getEntityType());
        comment.setContent(dto.getContent());
        comment.setUserFullName(dto.getUserFullName());
        comment.setUserAvatarUrl(dto.getUserAvatarUrl());
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    // ✅ Overload: tạo bình luận kèm hình ảnh
    @Transactional
    public Comment createComment(CommentDTO dto, List<MultipartFile> images) {
        Comment comment = new Comment();
        comment.setUserId(dto.getUserId());
        comment.setEntityId(dto.getEntityId());
        comment.setEntityType(dto.getEntityType());
        comment.setContent(dto.getContent());
        comment.setUserFullName(dto.getUserFullName());
        comment.setUserAvatarUrl(dto.getUserAvatarUrl());
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        if (images != null && !images.isEmpty()) {
            createUploadDirIfNotExist();

            List<CommentImage> imageEntities = new ArrayList<>();
            for (MultipartFile file : images) {
                try {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    File dest = new File(uploadDir, fileName);
                    file.transferTo(dest);

                    CommentImage img = new CommentImage();
                    img.setComment(savedComment);
                    img.setImageUrl("/uploads/comments/" + fileName);
                    imageEntities.add(img);
                } catch (IOException e) {
                    throw new RuntimeException("Lỗi khi lưu ảnh bình luận", e);
                }
            }
            savedComment.setImages(imageEntities);
        }

        return savedComment;
    }

    // === Logic cho Đã lưu (Saved Item) ===

    @Transactional
    public SavedItem saveItem(SavedItemDTO dto) {
        Optional<SavedItem> existing = savedItemRepository.findByUserIdAndEntityIdAndEntityType(
                dto.getUserId(), dto.getEntityId(), dto.getEntityType()
        );

        if (existing.isPresent()) {
            return existing.get();
        }

        SavedItem savedItem = new SavedItem();
        savedItem.setUserId(dto.getUserId());
        savedItem.setEntityId(dto.getEntityId());
        savedItem.setEntityType(dto.getEntityType());
        return savedItemRepository.save(savedItem);
    }

    @Transactional
    public void unsaveItem(SavedItemDTO dto) {
        savedItemRepository.findByUserIdAndEntityIdAndEntityType(
                dto.getUserId(), dto.getEntityId(), dto.getEntityType()
        ).ifPresent(savedItemRepository::delete);
    }

    public List<SavedItem> getSavedItems(Long userId, EntityType entityType) {
        return savedItemRepository.findByUserIdAndEntityType(userId, entityType);
    }

    // ✅ Reply comment
    @Transactional
    public Comment replyToComment(Long parentCommentId, CommentDTO dto, List<MultipartFile> images) {
        Comment parent = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Comment cha không tồn tại"));

        Comment reply = new Comment();
        reply.setUserId(dto.getUserId());
        reply.setEntityId(parent.getEntityId());
        reply.setEntityType(parent.getEntityType());
        reply.setContent(dto.getContent());
        reply.setUserFullName(dto.getUserFullName());
        reply.setUserAvatarUrl(dto.getUserAvatarUrl());
        reply.setCreatedAt(LocalDateTime.now());
        reply.setParent(parent);

        Comment savedReply = commentRepository.save(reply);

        if (images != null && !images.isEmpty()) {
            createUploadDirIfNotExist();

            List<CommentImage> imageEntities = new ArrayList<>();
            for (MultipartFile file : images) {
                try {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    File dest = new File(uploadDir, fileName);
                    file.transferTo(dest);

                    CommentImage img = new CommentImage();
                    img.setComment(savedReply);
                    img.setImageUrl("/uploads/comments/" + fileName);
                    imageEntities.add(img);
                } catch (IOException e) {
                    throw new RuntimeException("Lỗi khi lưu ảnh reply", e);
                }
            }
            savedReply.setImages(imageEntities);
        }

        return savedReply;
    }
}
