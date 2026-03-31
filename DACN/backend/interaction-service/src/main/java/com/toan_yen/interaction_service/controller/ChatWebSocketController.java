package com.toan_yen.interaction_service.controller;

import com.toan_yen.interaction_service.Entities.ChatMessage;
import com.toan_yen.interaction_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // Frontend gửi tới /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.info("WS gửi tin nhắn: sender={}, receiver={}, content={}",
                chatMessage.getSenderId(), chatMessage.getReceiverId(), chatMessage.getContent());

        // Lưu DB
        ChatMessage saved = chatService.sendMessage(
                chatMessage.getSenderId(),
                chatMessage.getReceiverId(),
                chatMessage.getContent()
        );

        // Gửi realtime cho người nhận
        messagingTemplate.convertAndSendToUser(
                saved.getReceiverId().toString(),
                "/queue/messages",
                saved
        );

        // Gửi realtime cho người gửi
        messagingTemplate.convertAndSendToUser(
                saved.getSenderId().toString(),
                "/queue/messages",
                saved
        );
    }
}
