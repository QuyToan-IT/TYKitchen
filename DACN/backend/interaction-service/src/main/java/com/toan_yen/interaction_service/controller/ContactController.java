package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.Entities.Contact;
import com.toan_yen.interaction_service.Entities.ContactType;
import com.toan_yen.interaction_service.dto.ContactRequest;
import com.toan_yen.interaction_service.dto.ReplyRequest;
import com.toan_yen.interaction_service.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody ContactRequest request) {
        Long userId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            // Logic lấy ID user tùy thuộc vào JWT config của bạn
            // userId = ...
        }
        contactService.createContact(request, userId);
        return ResponseEntity.ok("Đã gửi liên hệ!");
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> reply(@PathVariable Long id, @RequestBody ReplyRequest request) {
        contactService.replyContact(id, request.getContent());
        return ResponseEntity.ok("Đã gửi phản hồi!");
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getAll() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/types")
    public ResponseEntity<Map<String, String>> getTypes() {
        Map<String, String> types = new HashMap<>();
        for (ContactType type : ContactType.values()) {
            types.put(type.name(), type.getDescription());
        }
        return ResponseEntity.ok(types);
    }
}