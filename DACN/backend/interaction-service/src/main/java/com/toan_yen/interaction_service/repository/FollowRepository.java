package com.toan_yen.interaction_service.repository;

import com.toan_yen.interaction_service.Entities.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowingId(Long followingId); // Đếm số người theo dõi user này (Followers)
    long countByFollowerId(Long followerId);   // Đếm số người user này đang theo dõi (Following)
}
