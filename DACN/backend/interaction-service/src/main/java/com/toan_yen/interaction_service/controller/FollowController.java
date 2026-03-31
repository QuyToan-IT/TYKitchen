package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.service.FollowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(
            @PathVariable("userId") Long followingId,
            @RequestHeader("x-user-id") Long followerId) {
        log.info("POST /users/{}/follow | followerId={}", followingId, followerId);

        try {
            followService.followUser(followerId, followingId);
            return ResponseEntity.ok(Map.of("message", "Đã theo dõi thành công"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable("userId") Long followingId,
            @RequestHeader("x-user-id") Long followerId) {
        log.info("DELETE /users/{}/follow | followerId={}", followingId, followerId);

        followService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok(Map.of("message", "Đã bỏ theo dõi thành công"));
    }

    @GetMapping("/{userId}/is-following")
    public ResponseEntity<?> checkIsFollowing(
            @PathVariable("userId") Long followingId,
            @RequestHeader(value = "x-user-id", required = false) Long followerId) {
        log.info("GET /users/{}/is-following | followerId={}", followingId, followerId);

        if (followerId == null) {
            return ResponseEntity.ok(Map.of("isFollowing", false));
        }

        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }
}
