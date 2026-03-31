package com.toan_yen.user_service.controller;

import com.toan_yen.user_service.dto.PasswordChangeDTO;
import com.toan_yen.user_service.dto.UserDTO;
import com.toan_yen.user_service.dto.UserUpdateDTO;
import com.toan_yen.user_service.model.User;
import com.toan_yen.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ Lấy danh sách tất cả người dùng
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ Lấy thông tin người dùng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ✅ Lấy thông tin user hiện tại (profile của chính mình)
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User user = userService.getUserEntityByEmail(email); // ✅ dùng entity
            return ResponseEntity.ok(new UserDTO(user));
        }

        return ResponseEntity.status(403).build();
    }

    // ✅ Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @RequestBody UserUpdateDTO dto,
                                              Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User currentUser = userService.getUserEntityByEmail(email); // ✅ entity
            return ResponseEntity.ok(userService.updateUser(id, dto, currentUser));
        }
        return ResponseEntity.status(403).build();
    }

    // ✅ Đổi mật khẩu
    @PutMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long id,
                                                 @RequestBody PasswordChangeDTO dto,
                                                 Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User currentUser = userService.getUserEntityByEmail(email); // ✅ entity
            userService.changePassword(id, dto, currentUser);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        }
        return ResponseEntity.status(403).build();
    }

    // ✅ Upload avatar
    @PostMapping("/{id}/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(@PathVariable Long id,
                                                @RequestParam("file") MultipartFile file,
                                                Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User currentUser = userService.getUserEntityByEmail(email); // ✅ entity
            return ResponseEntity.ok(userService.uploadAvatar(id, file, currentUser));
        }
        return ResponseEntity.status(403).build();
    }

    // ✅ Xóa người dùng (Admin có thể xóa bất kỳ, User chỉ xóa chính mình)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User currentUser = userService.getUserEntityByEmail(email); // ✅ entity
            userService.deleteUser(id, currentUser);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(403).build();
    }
}
