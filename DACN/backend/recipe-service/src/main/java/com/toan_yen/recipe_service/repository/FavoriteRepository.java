package com.toan_yen.recipe_service.repository;

import com.toan_yen.recipe_service.Entities.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // SỬA: Đơn giản hóa EntityGraph. Chỉ cần fetch "recipe".
    // Các collection con của Recipe đã là EAGER nên sẽ được tự động fetch theo.
    @EntityGraph(attributePaths = {"recipe"})
    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndRecipeId(Long userId, Long recipeId);

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    void deleteByUserIdAndRecipeId(Long userId, Long recipeId);
}
