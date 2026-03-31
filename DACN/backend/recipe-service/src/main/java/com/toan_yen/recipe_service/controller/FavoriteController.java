package com.toan_yen.recipe_service.controller;

import com.toan_yen.recipe_service.dto.FavoriteDTO;
import com.toan_yen.recipe_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Lấy danh sách các công thức đã yêu thích của người dùng hiện tại.
     * Gateway đã chèn header "x-user-id" sau khi xác thực token.
     * @param userId ID của người dùng.
     * @return Danh sách các công thức yêu thích (FavoriteDTO).
     */
    @GetMapping
    public ResponseEntity<List<FavoriteDTO>> getFavorites(
            @RequestHeader("x-user-id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("GET /api/v1/favorites - Lấy danh sách yêu thích cho userId={}", userId);
        // SỬA: Truyền token vào service
        List<FavoriteDTO> favorites = favoriteService.getFavorites(userId, token);
        return ResponseEntity.ok(favorites);
    }

    /**
     * Thêm một công thức vào danh sách yêu thích.
     * @param recipeId ID của công thức cần thêm.
     * @param userId ID của người dùng.
     * @return Trạng thái 201 Created nếu thành công.
     */
    @PostMapping("/{recipeId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long recipeId,
                                            @RequestHeader("x-user-id") Long userId) {
        log.info("POST /api/v1/favorites - User {} thêm recipeId={}", userId, recipeId);
        favoriteService.addFavorite(recipeId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Xóa một công thức khỏi danh sách yêu thích.
     * @param recipeId ID của công thức cần xóa.
     * @param userId ID của người dùng.
     * @return Trạng thái 204 No Content nếu thành công.
     */
    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long recipeId,
                                               @RequestHeader("x-user-id") Long userId) {
        log.info("DELETE /api/v1/favorites - User {} xóa recipeId={}", userId, recipeId);
        favoriteService.removeFavorite(recipeId, userId);
        return ResponseEntity.noContent().build();
    }
}
