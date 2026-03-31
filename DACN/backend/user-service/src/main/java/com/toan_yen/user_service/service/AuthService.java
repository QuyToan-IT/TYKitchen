package com.toan_yen.user_service.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.toan_yen.user_service.dto.AuthResponse;
import com.toan_yen.user_service.dto.LoginRequest;
import com.toan_yen.user_service.dto.RegisterRequest;
import com.toan_yen.user_service.model.Role;
import com.toan_yen.user_service.model.User;
import com.toan_yen.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // TODO: Thay bằng Client ID thật của bạn
    private final String GOOGLE_CLIENT_ID = "290492023692-qddn01oqnmg9cb91sv3gd162g8pdsm9l.apps.googleusercontent.com";

    // 1. ĐĂNG KÝ USER THƯỜNG
    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Entity của bạn không có field username riêng, dùng email làm username rồi nên bỏ qua setUsername
        // Mặc định user mới enable
        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);

        String roleFromRequest = request.getRole();
        if ("ADMIN".equalsIgnoreCase(roleFromRequest)) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }

        var savedUser = userRepository.saveAndFlush(user);
        return generateAuthResponse(savedUser);
    }

    // 2. ĐĂNG NHẬP USER THƯỜNG
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật thời gian đăng nhập lần cuối (nếu muốn)
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    // 3. ĐĂNG NHẬP GOOGLE
    public AuthResponse loginWithGoogle(String googleToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                return processSocialUser(email, name, pictureUrl);
            } else {
                throw new RuntimeException("Token Google không hợp lệ");
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực Google: " + e.getMessage());
        }
    }

    // 4. ĐĂNG NHẬP FACEBOOK
    public AuthResponse loginWithFacebook(String fbAccessToken) {
        try {
            String facebookGraphUrl = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + fbAccessToken;
            
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> fbData = restTemplate.getForObject(facebookGraphUrl, Map.class);
            
            if (fbData == null || fbData.get("email") == null) {
                 throw new RuntimeException("Không lấy được email từ Facebook (Email có thể bị ẩn)");
            }

            String email = (String) fbData.get("email");
            String name = (String) fbData.get("name");
            
            String pictureUrl = null; 
            if(fbData.containsKey("picture")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> picObj = (Map<String, Object>) fbData.get("picture");
                if (picObj != null && picObj.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dataObj = (Map<String, Object>) picObj.get("data");
                    if (dataObj != null) {
                        pictureUrl = (String) dataObj.get("url");
                    }
                }
            }

            return processSocialUser(email, name, pictureUrl);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực Facebook: " + e.getMessage());
        }
    }

    // HÀM HỖ TRỢ (PRIVATE) - Logic tìm hoặc tạo user mới
    private AuthResponse processSocialUser(String email, String name, String avatarUrl) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // User chưa tồn tại -> Tạo mới
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            
            // ✅ SỬA: Dùng setAvatarUrl thay vì setAvatar
            user.setAvatarUrl(avatarUrl);
            
            // ✅ BỎ: user.setUsername(email) vì Entity không có trường username
            
            user.setRole(Role.USER);
            user.setPassword(passwordEncoder.encode("SOCIAL_LOGIN_" + UUID.randomUUID())); 
            
            // Set các trường mặc định
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);
            user.setLastLoginAt(ZonedDateTime.now());
            
            user = userRepository.save(user);
        } else {
             // User đã tồn tại -> Cập nhật lại Avatar và thời gian login
             user.setAvatarUrl(avatarUrl);
             user.setLastLoginAt(ZonedDateTime.now());
             userRepository.save(user);
        }

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        var claims = new HashMap<String, Object>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String jwtToken = jwtService.generateToken(claims, user);
        return AuthResponse.builder().token(jwtToken).build();
    }
}