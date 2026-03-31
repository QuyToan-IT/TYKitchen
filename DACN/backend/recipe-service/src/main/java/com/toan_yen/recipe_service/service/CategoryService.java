package com.toan_yen.recipe_service.service;

import com.toan_yen.recipe_service.Entities.Category;
import com.toan_yen.recipe_service.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Lấy tất cả danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy theo id
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Thêm danh mục mới
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Cập nhật danh mục
    public Category updateCategory(Long id, Category updatedCategory) {
        return categoryRepository.findById(id).map(cat -> {
            cat.setName(updatedCategory.getName());
            return categoryRepository.save(cat);
        }).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    // Xóa danh mục
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
