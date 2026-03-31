package com.toan_yen.interaction_service.Entities;

public enum ContactType {
    HOP_TAC_QUANG_CAO("Hợp tác/Quảng cáo"), // Booking, QC
    PHAN_HOI_CONG_THUC("Phản hồi công thức"), // Món này mặn quá, thiếu gia vị...
    HO_TRO_KY_THUAT("Hỗ trợ kỹ thuật"), // Lỗi web, không xem được video...
    KHAC("Khác"); // Lý do khác

    private final String description;

    ContactType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}