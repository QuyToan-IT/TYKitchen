package com.toan_yen.user_service.controller;

import com.toan_yen.user_service.dto.AuthResponse;
import com.toan_yen.user_service.dto.LoginRequest;
import com.toan_yen.user_service.dto.RegisterRequest;
import com.toan_yen.user_service.dto.SocialLoginRequest; // ✅ Import DTO mới
import com.toan_yen.user_service.service.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. Đăng ký tài khoản thường
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // 2. Đăng nhập tài khoản thường
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // ==========================================
    // MỚI THÊM: SOCIAL LOGIN ENDPOINTS
    // ==========================================

    // 3. Đăng nhập Google
    @PostMapping("/login/google")
    public ResponseEntity<AuthResponse> loginGoogle(@RequestBody SocialLoginRequest request) {
        // Gọi service xử lý token Google và trả về JWT của hệ thống
        return ResponseEntity.ok(authService.loginWithGoogle(request.getToken()));
    }

    // 4. Đăng nhập Facebook
    @PostMapping("/login/facebook")
    public ResponseEntity<AuthResponse> loginFacebook(@RequestBody SocialLoginRequest request) {
        // Gọi service xử lý token Facebook và trả về JWT của hệ thống
        return ResponseEntity.ok(authService.loginWithFacebook(request.getToken()));
    }
}