package com.toan_yen.recipe_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.toan_yen.recipe_service.Entities.Nutrition;

@Repository
public interface NutritionRepository extends JpaRepository<Nutrition, Long> {}