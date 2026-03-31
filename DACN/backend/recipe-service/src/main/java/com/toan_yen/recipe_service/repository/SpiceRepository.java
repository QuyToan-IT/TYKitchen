package com.toan_yen.recipe_service.repository;
import com.toan_yen.recipe_service.Entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpiceRepository extends JpaRepository<Spice, Long> {}
