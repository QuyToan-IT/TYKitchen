package com.toan_yen.user_service.dto;

import java.time.ZonedDateTime;

import com.toan_yen.user_service.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private ZonedDateTime lastLoginAt;

    // ✅ Trường mới
    private String avatarUrl;
    private String description;

    // Constructor chuyển từ entity User sang DTO
    public UserDTO(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.lastLoginAt = user.getLastLoginAt();
        this.avatarUrl = user.getAvatarUrl();
        this.description = user.getDescription();
    }
}
