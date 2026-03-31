package com.toan_yen.interaction_service.dto;

import com.toan_yen.interaction_service.Entities.ContactType;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String subject;
    private ContactType requestType; // Tự map từ JSON string
    private String message;
}
