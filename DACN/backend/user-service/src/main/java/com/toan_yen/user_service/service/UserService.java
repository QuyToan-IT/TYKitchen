package com.toan_yen.user_service.service;

import com.toan_yen.user_service.dto.PasswordChangeDTO;
import com.toan_yen.user_service.dto.UserDTO;
import com.toan_yen.user_service.dto.UserUpdateDTO;
import com.toan_yen.user_service.model.User;
import com.toan_yen.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${user.upload-dir}")
    private String uploadDir;

    // ✅ Lấy thông tin người dùng theo ID (trả về DTO)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        return new UserDTO(user);
    }

    // ✅ Lấy entity User theo email (dùng trong controller để lấy currentUser)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));
    }

    // ✅ Lấy thông tin người dùng theo email (trả về DTO)
    public UserDTO getUserByEmail(String email) {
        User user = getUserEntityByEmail(email);
        return new UserDTO(user);
    }

    // ✅ Lấy danh sách tất cả người dùng
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::new)
                .toList();
    }

    // ✅ Cập nhật thông tin cá nhân
    public UserDTO updateUser(Long id, UserUpdateDTO dto, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Nếu không phải admin thì chỉ được sửa chính mình
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            throw new RuntimeException("Bạn chỉ có thể cập nhật thông tin của chính mình");
        }

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getAvatarUrl() != null && !dto.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            user.setDescription(dto.getDescription());
        }

        userRepository.save(user);
        return new UserDTO(user);
    }

    // ✅ Đổi mật khẩu
    public void changePassword(Long id, PasswordChangeDTO dto, User currentUser) {
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            throw new RuntimeException("Bạn chỉ có thể đổi mật khẩu của chính mình");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    // ✅ Xóa người dùng
    public void deleteUser(Long id, User currentUser) {
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            throw new RuntimeException("Bạn chỉ có thể xóa tài khoản của chính mình");
        }
        userRepository.deleteById(id);
    }

    // ✅ Kiểm tra tồn tại người dùng theo email
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // ✅ Upload avatar
    public UserDTO uploadAvatar(Long id, MultipartFile file, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Chỉ admin hoặc chính chủ mới được đổi avatar
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            throw new RuntimeException("Bạn chỉ có thể đổi avatar của chính mình");
        }

        try {
            // Tạo thư mục nếu chưa có
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            // Lưu file
            String fileName = id + "_" + file.getOriginalFilename();
            Path filePath = dirPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Cập nhật avatarUrl trong DB
            user.setAvatarUrl("/uploads/user/" + fileName);
            userRepository.save(user);

            return new UserDTO(user);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload avatar: " + e.getMessage());
        }
    }
}
