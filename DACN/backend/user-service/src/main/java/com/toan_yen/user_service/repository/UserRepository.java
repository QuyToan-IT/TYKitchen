package com.toan_yen.user_service.repository;

import com.toan_yen.user_service.model.User;
import com.toan_yen.user_service.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByFullNameContainingIgnoreCase(String keyword);

    Optional<User> findByAvatarUrl(String avatarUrl);

    List<User> findByDescriptionContainingIgnoreCase(String keyword);
}
