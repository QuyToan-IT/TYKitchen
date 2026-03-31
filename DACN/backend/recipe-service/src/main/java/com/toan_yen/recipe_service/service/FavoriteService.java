package com.toan_yen.recipe_service.service;

import com.toan_yen.recipe_service.Entities.Favorite;
import com.toan_yen.recipe_service.Entities.Recipe;
import com.toan_yen.recipe_service.dto.FavoriteDTO;
import com.toan_yen.recipe_service.dto.RecipeDTO;
import com.toan_yen.recipe_service.repository.FavoriteRepository;
import com.toan_yen.recipe_service.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    /** Thêm một công thức vào danh sách yêu thích */
    @Transactional
    public void addFavorite(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công thức với ID: " + recipeId));

        if (favoriteRepository.existsByUserIdAndRecipeId(userId, recipeId)) {
            throw new IllegalStateException("Công thức này đã có trong danh sách yêu thích.");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setRecipe(recipe);
        favoriteRepository.save(favorite);

        log.info("User {} đã thêm recipe {} vào favorites", userId, recipeId);
    }

    /** Xóa một công thức khỏi danh sách yêu thích */
    @Transactional
    public void removeFavorite(Long recipeId, Long userId) {
        Favorite favorite = favoriteRepository.findByUserIdAndRecipeId(userId, recipeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công thức yêu thích để xóa."));
        favoriteRepository.delete(favorite);

        log.info("User {} đã xóa recipe {} khỏi favorites", userId, recipeId);
    }

    /** Lấy danh sách các công thức yêu thích của user */
    @Transactional
    public List<FavoriteDTO> getFavorites(Long userId, String token) {
    List<Favorite> favorites = favoriteRepository.findByUserId(userId);
    return favorites.stream()
            .map(fav -> FavoriteDTO.builder()
                    .id(fav.getId())
                    .userId(userId)
                    .recipe(recipeService.convertToDTO(fav.getRecipe(), token))
                    .build())
            .collect(Collectors.toList());
}

}
