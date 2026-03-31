package com.toan_yen.interaction_service.service;

import com.toan_yen.interaction_service.Entities.Follow;
import com.toan_yen.interaction_service.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;

    @Transactional
    public void followUser(Long followerId, Long followingId) {
        System.out.println("[FollowService] followUser: followerId=" + followerId + ", followingId=" + followingId);
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Không thể tự theo dõi chính mình");
        }
        // Kiểm tra nếu đã theo dõi rồi thì không làm gì cả
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }
        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();
        followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(Long followerId, Long followingId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .ifPresent(followRepository::delete);
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    public long countFollowers(Long userId) {
        return followRepository.countByFollowingId(userId);
    }
}
