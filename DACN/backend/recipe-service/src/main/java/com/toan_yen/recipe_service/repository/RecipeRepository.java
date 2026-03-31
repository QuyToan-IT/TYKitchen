package com.toan_yen.recipe_service.repository;

import com.toan_yen.recipe_service.Entities.Difficulty;
import com.toan_yen.recipe_service.Entities.Recipe;
import com.toan_yen.recipe_service.Entities.RecipeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // =======================================================
    // 1. API PUBLIC - CHỈ LẤY CÁC BÀI CÓ STATUS = ACCEPTED
    // =======================================================

    /** Lấy tất cả các công thức đã được chấp nhận, sắp xếp mới nhất -> cũ nhất */
    List<Recipe> findAllByStatusOrderByCreatedAtDesc(RecipeStatus status);

    /** Lấy tất cả các công thức đã được chấp nhận, sắp xếp cũ nhất -> mới nhất */
    List<Recipe> findAllByStatusOrderByCreatedAtAsc(RecipeStatus status);
    
    /** Lọc theo danh mục và chỉ lấy bài đã ACCEPTED */
    List<Recipe> findByCategory_NameAndStatus(String name, RecipeStatus status);

    /** Lọc theo ID danh mục và chỉ lấy bài đã ACCEPTED */
    List<Recipe> findByCategoryIdAndStatus(Long categoryId, RecipeStatus status);

    /** Lọc theo từ khóa trong tiêu đề và chỉ lấy bài đã ACCEPTED */
    List<Recipe> findByTitleContainingIgnoreCaseAndStatus(String keyword, RecipeStatus status);

    /** Lọc theo độ khó và chỉ lấy bài đã ACCEPTED */
    List<Recipe> findByDifficultyAndStatus(Difficulty difficulty, RecipeStatus status);

    /** Lọc theo danh mục, độ khó và chỉ lấy bài đã ACCEPTED */
    List<Recipe> findByCategory_NameAndDifficultyAndStatus(String name, Difficulty difficulty, RecipeStatus status);

    /** Lấy món ăn MỚI NHẤT theo danh mục và chỉ lấy bài đã ACCEPTED */
    Recipe findTopByCategory_NameAndStatusOrderByCreatedAtDesc(String name, RecipeStatus status);

    /** Lấy chi tiết một bài đã ACCEPTED */
    Optional<Recipe> findByIdAndStatus(Long id, RecipeStatus status);


    // =======================================================
    // 2. API MODERATION - DÙNG CHO ADMIN (Không cần lọc ACCEPTED)
    // =======================================================
    
    /** Lấy tất cả các bài theo trạng thái cụ thể (Dùng để lấy PENDING) */
    List<Recipe> findAllByStatus(RecipeStatus status);
    
    /** Lấy các bài theo trạng thái VÀ tiêu đề (Dùng để tìm kiếm trong danh sách chờ duyệt) */
    List<Recipe> findAllByStatusAndTitleContainingIgnoreCase(RecipeStatus status, String title);

    
    // =======================================================
    // 3. API NỘI BỘ (Đã bị thay thế hoặc ít dùng trong luồng public)
    // =======================================================
    
    // Các phương thức cũ (findByCategory_Name, findByTitleContainingIgnoreCase, findAllByOrderByCreatedAtDesc, ...) 
    // KHÔNG NÊN được dùng trong luồng public nữa vì chúng không kiểm tra trạng thái duyệt bài.
    // Nếu cần dùng cho mục đích nội bộ khác (ví dụ: Admin xem mọi bài), giữ lại hoặc dùng findById() thường.
    List<Recipe> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Lấy tất cả các công thức, sắp xếp mới nhất -> cũ nhất */
    List<Recipe> findAllByOrderByCreatedAtDesc();

}