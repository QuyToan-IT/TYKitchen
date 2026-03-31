package com.toan_yen.user_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserUpdateDTO {
    private String fullName;     // có thể cho phép đổi tên
    private String avatarUrl;    // cập nhật avatar
    private String description;  // cập nhật mô tả cá nhân
}
