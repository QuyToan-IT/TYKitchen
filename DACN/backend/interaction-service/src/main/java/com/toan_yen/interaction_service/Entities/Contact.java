package com.toan_yen.interaction_service.Entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
@Data
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String subject;

    @Enumerated(EnumType.STRING)
    private ContactType requestType; // Lưu dạng String: PHAN_HOI_CONG_THUC

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String replyMessage; // Nội dung Admin trả lời

    private boolean isReplied = false;

    private Long userId; // ID người dùng (nếu đã login)

    private LocalDateTime createdAt = LocalDateTime.now();
}