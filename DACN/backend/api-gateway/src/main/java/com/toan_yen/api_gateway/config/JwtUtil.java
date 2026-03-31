package com.toan_yen.api_gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

/**
 * Lớp này dùng để "soi" (validate) và trích xuất thông tin từ JWT token.
 * Được sử dụng trong AuthenticationFilter.
 */
@Component
public class JwtUtil {

    // Lấy key từ file properties (Đảm bảo khớp với jwt.secret-key)
    @Value("${jwt.secret-key}")
    private String SECRET_KEY;

    /**
     * Lấy key bí mật (phải giống hệt user-service)
     */
    private Key getSignInKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Hàm "soi" token (chỉ validate, không trả về claims)
     */
    public void validateToken(final String token) {
        // Hàm parseClaimsJws sẽ tự động báo lỗi nếu token sai hoặc hết hạn
        Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token);
    }
    
    /**
     * Trích xuất tất cả Claims từ token
     */
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Phương thức mới: Lấy Role từ token
     * @param token JWT
     * @return Role (ví dụ: "user", "admin")
     */
    public String getRoleFromToken(String token) {
        // Giả định key trong payload JWT là "role" (kiểu String)
        return getAllClaimsFromToken(token).get("role", String.class);
    }

    /**
     * Phương thức mới: Lấy User ID từ token
     * @param token JWT
     * @return User ID
     */
    public Long getUserIdFromToken(String token) {
        // Giả định key trong payload JWT là "userId"
        // Cần xử lý trường hợp ID được serialize dưới dạng Integer (vì Integer là kiểu mặc định của JSON number nhỏ)
        Object id = getAllClaimsFromToken(token).get("userId");
        
        if (id instanceof Integer) {
            return ((Integer) id).longValue();
        }
        return (Long) id; // Hoặc trả về Long nếu nó đã là Long
    }
}