package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.Entities.ChatMessage;
import com.toan_yen.interaction_service.dto.MessageRequestDTO;
import com.toan_yen.interaction_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestHeader("x-user-id") Long senderId,
            @RequestParam("receiverId") Long receiverId,
            @RequestBody MessageRequestDTO request) {

        log.info("REST gửi tin nhắn: sender={}, receiver={}, content={}", senderId, receiverId, request.getContent());
        ChatMessage message = chatService.sendMessage(senderId, receiverId, request.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessage>> getConversation(
            @RequestParam("user1") Long user1,
            @RequestParam("user2") Long user2) {

        log.info("REST lấy conversation giữa {} và {}", user1, user2);
        return ResponseEntity.ok(chatService.getConversation(user1, user2));
    }
}
