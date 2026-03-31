package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.dto.CommentDTO;
import com.toan_yen.interaction_service.dto.SavedItemDTO;
import com.toan_yen.interaction_service.Entities.Comment;
import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.SavedItem;
import com.toan_yen.interaction_service.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/v1") // API chung
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    // === API cho Bình luận (Comment) ===

   /**
     * Lấy tất cả bình luận cha (parent = null) cho 1 món ăn HOẶC 1 bài viết.
     * Mỗi bình luận cha sẽ có danh sách replies bên trong.
     * GET /api/v1/comments?entityType=RECIPE&entityId=1
     */
    @GetMapping("/comments")
    public ResponseEntity<List<Comment>> getComments(
            @RequestParam EntityType entityType,
            @RequestParam Long entityId
    ) {
        List<Comment> comments = interactionService.getCommentsForEntity(entityType, entityId);
        return ResponseEntity.ok(comments);
    }
     /**
     * Tạo một bình luận mới (có thể kèm nhiều ảnh)
     * POST /api/v1/comments
     */
    @PostMapping(value = "/comments", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Comment> createComment(
            @RequestPart("comment") CommentDTO commentDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        // TODO: Lấy userId, userFullName, userAvatarUrl từ JWT
        Comment createdComment = interactionService.createComment(commentDTO, images);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // === API cho Đã lưu (Saved Item) ===

    /**
     * Lấy tất cả MÓN ĂN (hoặc BÀI VIẾT) đã lưu của 1 user
     * GET /api/v1/users/1/saved-items?entityType=RECIPE
     */
    @GetMapping("/users/{userId}/saved-items")
    public ResponseEntity<List<SavedItem>> getSavedItems(
            @PathVariable Long userId,
            @RequestParam EntityType entityType
    ) {
        // TODO: Chỉ chủ user (hoặc admin) mới được xem
        return ResponseEntity.ok(interactionService.getSavedItems(userId, entityType));
    }

    /**
     * Lưu một món ăn / bài viết
     * POST /api/v1/saved-items
     */
    @PostMapping("/saved-items")
    public ResponseEntity<SavedItem> saveItem(@RequestBody SavedItemDTO savedItemDTO) {
        // TODO: Lấy userId từ JWT
        return ResponseEntity.ok(interactionService.saveItem(savedItemDTO));
    }

    /**
     * Bỏ lưu một món ăn / bài viết
     * DELETE /api/v1/saved-items
     */
    @DeleteMapping("/saved-items")
    public ResponseEntity<Void> unsaveItem(@RequestBody SavedItemDTO savedItemDTO) {
        // TODO: Lấy userId từ JWT
        interactionService.unsaveItem(savedItemDTO);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/comments/{parentId}/reply", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Comment> replyToComment(
        @PathVariable Long parentId,
        @RequestPart("comment") CommentDTO commentDTO,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
) {
    Comment reply = interactionService.replyToComment(parentId, commentDTO, images);
    return new ResponseEntity<>(reply, HttpStatus.CREATED);
}

}
