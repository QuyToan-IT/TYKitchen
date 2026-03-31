package com.toan_yen.interaction_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.toan_yen.interaction_service.Entities.Contact;
import com.toan_yen.interaction_service.dto.ContactRequest;
import com.toan_yen.interaction_service.repository.ContactRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final JavaMailSender mailSender;

    // Email Admin nhận thông báo
    private final String ADMIN_EMAIL = "toantony194@gmail.com"; 

    public Contact createContact(ContactRequest request, Long userId) {
        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setSubject(request.getSubject());
        contact.setRequestType(request.getRequestType());
        contact.setMessage(request.getMessage());
        
        if (userId != null) {
            contact.setUserId(userId);
        }

        Contact savedContact = contactRepository.save(contact);

        // Gửi email thông báo cho Admin
        sendNotificationToAdmin(savedContact);

        return savedContact;
    }

    public void replyContact(Long contactId, String replyContent) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy liên hệ"));

        // Gửi email phản hồi cho khách
        sendEmail(contact.getEmail(), "Phản hồi từ Ty's Kitchen: " + contact.getSubject(), replyContent);

        // Cập nhật trạng thái
        contact.setReplyMessage(replyContent);
        contact.setReplied(true);
        contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    // --- Helper Methods ---

    private void sendNotificationToAdmin(Contact contact) {
        String prefix = switch (contact.getRequestType()) {
            case HOP_TAC_QUANG_CAO -> "💰 [BOOKING]";
            case PHAN_HOI_CONG_THUC -> "🍳 [GÓP Ý MÓN]";
            case HO_TRO_KY_THUAT -> "🔧 [LỖI WEB]";
            default -> "📩 [LIÊN HỆ]";
        };

        String subject = String.format("%s %s - từ %s", prefix, contact.getSubject(), contact.getName());
        String body = String.format(
                "Người gửi: %s (%s)\nLoại: %s\nNội dung: %s",
                contact.getName(), contact.getEmail(), contact.getRequestType().getDescription(), contact.getMessage()
        );
        sendEmail(ADMIN_EMAIL, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi nếu gửi mail thất bại
        }
    }
}