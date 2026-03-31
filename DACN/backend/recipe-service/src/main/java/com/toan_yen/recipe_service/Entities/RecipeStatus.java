package com.toan_yen.recipe_service.Entities;

public enum RecipeStatus {
    PENDING,    // Đang chờ duyệt (Trạng thái mặc định khi người dùng đăng bài)
    APPROVED,   // Đã được chấp nhận và công khai
    REJECTED    // Đã bị từ chối
}