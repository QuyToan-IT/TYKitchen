package com.toan_yen.recipe_service.repository;

import com.toan_yen.recipe_service.Entities.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {}