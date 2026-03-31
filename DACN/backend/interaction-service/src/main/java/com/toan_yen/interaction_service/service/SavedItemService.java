package com.toan_yen.interaction_service.service;

import com.toan_yen.interaction_service.Entities.EntityType;
import com.toan_yen.interaction_service.Entities.SavedItem;
import com.toan_yen.interaction_service.repository.SavedItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SavedItemService {

    private final SavedItemRepository savedItemRepository;

    // Lấy tất cả món ăn đã lưu của user
    public List<SavedItem> getFavorites(Long userId) {
        return savedItemRepository.findByUserIdAndEntityType(userId, EntityType.RECIPE);
    }

    // Thêm món ăn vào favorites
    public SavedItem addFavorite(Long userId, Long recipeId) {
        Optional<SavedItem> existing = savedItemRepository
                .findByUserIdAndEntityIdAndEntityType(userId, recipeId, EntityType.RECIPE);

        if (existing.isPresent()) {
            return existing.get(); // đã có thì trả về luôn
        }

        SavedItem item = new SavedItem();
        item.setUserId(userId);
        item.setEntityId(recipeId);
        item.setEntityType(EntityType.RECIPE);
        return savedItemRepository.save(item);
    }

    // Xóa món ăn khỏi favorites
    public void removeFavorite(Long userId, Long recipeId) {
        savedItemRepository.deleteByUserIdAndEntityIdAndEntityType(userId, recipeId, EntityType.RECIPE);
    }
}
