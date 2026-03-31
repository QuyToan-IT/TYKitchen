package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.Entities.SavedItem;
import com.toan_yen.interaction_service.service.SavedItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class SavedItemController {

    private final SavedItemService savedItemService;

    // ✅ Lấy danh sách favorites
    @GetMapping
    public ResponseEntity<List<SavedItem>> getFavorites() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(savedItemService.getFavorites(userId));
    }

    // ✅ Thêm recipe vào favorites
    @PostMapping("/{recipeId}")
    public ResponseEntity<SavedItem> addFavorite(@PathVariable Long recipeId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(savedItemService.addFavorite(userId, recipeId));
    }

    // ✅ Xóa recipe khỏi favorites
    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long recipeId) {
        Long userId = getCurrentUserId();
        savedItemService.removeFavorite(userId, recipeId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Helper method lấy userId từ JWT (đã decode ở filter)
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal(); // principal chính là userId
    }
}
