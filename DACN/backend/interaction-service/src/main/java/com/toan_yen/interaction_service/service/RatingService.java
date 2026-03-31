package com.toan_yen.interaction_service.service;

import com.toan_yen.interaction_service.dto.AverageRatingDTO;
import com.toan_yen.interaction_service.dto.RatingDTO;
import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.Rating;
import com.toan_yen.interaction_service.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class RatingService {

    private static final Logger log = LoggerFactory.getLogger(RatingService.class);

    private final RatingRepository ratingRepository;

    @Transactional
    public Rating addOrUpdateRating(RatingDTO dto) {
        if (dto.getUserId() == null) {
            log.error("[RATING] userId=null khi gọi addOrUpdateRating. entityId={}, entityType={}, stars={}",
                    dto.getEntityId(), dto.getEntityType(), dto.getStars());
            throw new IllegalArgumentException("userId không được null");
        }

        log.info("[RATING] User {} gửi rating: entityId={}, entityType={}, stars={}",
                dto.getUserId(), dto.getEntityId(), dto.getEntityType(), dto.getStars());

        Optional<Rating> existingRating = ratingRepository.findByUserIdAndEntityIdAndEntityType(
                dto.getUserId(), dto.getEntityId(), dto.getEntityType()
        );

        if (existingRating.isPresent()) {
            Rating rating = existingRating.get();
            rating.setStars(dto.getStars());
            log.debug("[RATING] Cập nhật rating cho user {}: entityId={}, stars={}",
                    dto.getUserId(), dto.getEntityId(), dto.getStars());
            return ratingRepository.save(rating);
        } else {
            Rating newRating = new Rating();
            newRating.setUserId(dto.getUserId());
            newRating.setEntityId(dto.getEntityId());
            newRating.setEntityType(dto.getEntityType());
            newRating.setStars(dto.getStars());
            log.debug("[RATING] Tạo mới rating cho user {}: entityId={}, stars={}",
                    dto.getUserId(), dto.getEntityId(), dto.getStars());
            return ratingRepository.save(newRating);
        }
    }

    public AverageRatingDTO getAverageRating(EntityType entityType, Long entityId) {
        Double average = ratingRepository.findAverageStars(entityType, entityId);
        long count = ratingRepository.countByEntityTypeAndEntityId(entityType, entityId);

        if (average == null) {
            average = 0.0;
        }

        double roundedAverage = Math.round(average * 10.0) / 10.0;
        log.info("[RATING] Stats cho entityType={}, entityId={}: average={}, count={}",
                entityType, entityId, roundedAverage, count);

        return new AverageRatingDTO(roundedAverage, count);
    }

    public Optional<Rating> getRatingForUser(Long userId, EntityType entityType, Long entityId) {
        log.info("[RATING] Lấy rating của user {} cho entityType={}, entityId={}", userId, entityType, entityId);
        return ratingRepository.findByUserIdAndEntityIdAndEntityType(userId, entityId, entityType);
    }
}
