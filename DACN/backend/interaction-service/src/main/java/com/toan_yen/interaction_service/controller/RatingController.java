package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.dto.AverageRatingDTO;
import com.toan_yen.interaction_service.dto.RatingDTO;
import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.Rating;
import com.toan_yen.interaction_service.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {

    private static final Logger log = LoggerFactory.getLogger(RatingController.class);

    private final RatingService ratingService;

    // ✅ Thêm hoặc cập nhật rating
    @PostMapping
    public ResponseEntity<Rating> addOrUpdateRating(@RequestBody RatingDTO ratingDTO) {
        Long userId = getCurrentUserId();
        ratingDTO.setUserId(userId);
        log.info("[RATING] User {} gửi rating: entityId={}, entityType={}, stars={}",
                userId, ratingDTO.getEntityId(), ratingDTO.getEntityType(), ratingDTO.getStars());

        Rating savedRating = ratingService.addOrUpdateRating(ratingDTO);
        return ResponseEntity.ok(savedRating);
    }

    // ✅ Lấy trung bình rating cho entity
    @GetMapping("/stats")
    public ResponseEntity<AverageRatingDTO> getAverageRating(
            @RequestParam EntityType entityType,
            @RequestParam Long entityId
    ) {
        log.info("[RATING] Lấy stats cho entityType={}, entityId={}", entityType, entityId);
        return ResponseEntity.ok(ratingService.getAverageRating(entityType, entityId));
    }

    // ✅ Lấy rating của user cho entity
    @GetMapping("/user-rating")
    public ResponseEntity<Rating> getUserRating(
            @RequestParam EntityType entityType,
            @RequestParam Long entityId
    ) {
        Long userId = getCurrentUserId();
        log.info("[RATING] Lấy rating của user {} cho entityType={}, entityId={}", userId, entityType, entityId);
        Optional<Rating> rating = ratingService.getRatingForUser(userId, entityType, entityId);
        return rating.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Helper method lấy userId từ SecurityContext
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long) {
            return (Long) auth.getPrincipal();
        }
        throw new IllegalStateException("Không tìm thấy userId trong SecurityContext");
    }
}
