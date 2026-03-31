package com.toan_yen.interaction_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.toan_yen.interaction_service.Entities.Contact;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    // Lấy danh sách sắp xếp mới nhất lên đầu
    List<Contact> findAllByOrderByCreatedAtDesc();
}