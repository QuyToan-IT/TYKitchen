package com.toan_yen.interaction_service.service;

import com.toan_yen.interaction_service.Entities.ChatMessage;
import com.toan_yen.interaction_service.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Gửi tin nhắn: vừa lưu DB vừa phát realtime
    public ChatMessage sendMessage(Long senderId, Long receiverId, String content) {
        ChatMessage message = ChatMessage.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .timestamp(Instant.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // Phát realtime cho người nhận
        messagingTemplate.convertAndSendToUser(
                saved.getReceiverId().toString(),
                "/queue/messages",
                saved
        );

        // Phát realtime cho người gửi
        messagingTemplate.convertAndSendToUser(
                saved.getSenderId().toString(),
                "/queue/messages",
                saved
        );

        return saved;
    }

    // Lấy toàn bộ conversation giữa 2 user
    public List<ChatMessage> getConversation(Long user1, Long user2) {
        return chatMessageRepository.findConversation(user1, user2);
    }
}
