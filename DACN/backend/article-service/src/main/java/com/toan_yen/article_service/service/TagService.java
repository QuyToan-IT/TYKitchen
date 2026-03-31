package com.toan_yen.article_service.service;

import com.toan_yen.article_service.entities.Tag;
import com.toan_yen.article_service.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    // Tạo Tag mới
    @Transactional
    public Tag createTag(Tag tagData) {
        Tag tag = new Tag();
        tag.setName(tagData.getName());
        return tagRepository.save(tag);
    }

    // Lấy tất cả Tag
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    // Lấy Tag theo ID
    public Tag getTagById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
    }

    // Cập nhật Tag
    @Transactional
    public Tag updateTag(Long id, Tag tagDetails) {
        return tagRepository.findById(id).map(tag -> {
            tag.setName(tagDetails.getName());
            return tagRepository.save(tag);
        }).orElseThrow(() -> new RuntimeException("Tag not found"));
    }

    // Xóa Tag
    @Transactional
    public boolean deleteTag(Long id) {
        return tagRepository.findById(id).map(tag -> {
            tagRepository.delete(tag);
            return true;
        }).orElse(false);
    }
}
