package com.toan_yen.api_gateway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.logging.Logger;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    private static final Logger logger = Logger.getLogger(AuthenticationFilter.class.getName());

    // 1. DANH SÁCH API GET CÔNG KHAI (Ai cũng xem được)
    private static final List<String> PUBLIC_ROOT_PATHS_FOR_GET = List.of(
        "/api/v1/categories",
        "/api/v1/recipes",
        "/api/v1/ratings/stats",
        "/api/v1/comments",
        "/api/v1/articles",
        "/api/v1/tags",
        "/api/v1/users",
        "/api/v1/contacts/types" // <--- MỚI: Để frontend lấy danh sách loại yêu cầu
    );

    // 2. DANH SÁCH API POST CÔNG KHAI (Ai cũng gửi được)
    private static final List<String> PUBLIC_ROOT_PATHS_FOR_POST = List.of(
        "/api/v1/contacts" // <--- MỚI: Để khách vãng lai gửi form liên hệ
    );

    private final String AUTH_REQUIRED_PATH_PREFIX = "/api/v1/auth/";
    private final String ADMIN_REQUIRED_PATH = "/api/v1/moderation/";

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            String method = exchange.getRequest().getMethod().name();

            logger.info("[AUTH-FILTER] Incoming request path=" + path + ", method=" + method);

            // -----------------------------------------------------------
            // PHẦN 1: CÁC TRƯỜNG HỢP CHO QUA (BYPASS) KHÔNG CẦN TOKEN
            // -----------------------------------------------------------

            // 1. Cho qua các API Auth (Login, Register)
            if (path.startsWith(AUTH_REQUIRED_PATH_PREFIX)) {
                return chain.filter(exchange);
            }

            // 2. Cho qua file tĩnh (ảnh, video)
            if (path.startsWith("/uploads/")) {
                return chain.filter(exchange);
            }

            // 3. (QUAN TRỌNG) Cho qua method OPTIONS để trình duyệt không báo lỗi CORS
            if (method.equals(HttpMethod.OPTIONS.name())) {
                return chain.filter(exchange);
            }

            // 4. Cho qua các API GET công khai (Xem bài viết, comment, v.v.)
            if (method.equals(HttpMethod.GET.name()) && isPublicGetPath(path)) {
                logger.info("[AUTH-FILTER] Bypass public GET path: " + path);
                return chain.filter(exchange);
            }

            // 5. (MỚI) Cho qua các API POST công khai (Gửi liên hệ)
            if (method.equals(HttpMethod.POST.name()) && PUBLIC_ROOT_PATHS_FOR_POST.contains(path)) {
                logger.info("[AUTH-FILTER] Bypass public POST path: " + path);
                return chain.filter(exchange);
            }

            // -----------------------------------------------------------
            // PHẦN 2: KIỂM TRA TOKEN (VỚI CÁC REQUEST CÒN LẠI)
            // -----------------------------------------------------------
            
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warning("[AUTH-FILTER] Missing or invalid Authorization header");
                return this.onError(exchange, "Vui lòng đăng nhập (Thiếu Token)", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // Validate Token
                jwtUtil.validateToken(token);
                
                // Lấy thông tin từ Token
                String role = jwtUtil.getRoleFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);

                logger.info("[AUTH-FILTER] Token hợp lệ. userId=" + userId + ", role=" + role);

                // Kiểm tra quyền Admin cho các path đặc biệt
                if (path.startsWith(ADMIN_REQUIRED_PATH) && !"admin".equalsIgnoreCase(role)) {
                    logger.warning("[AUTH-FILTER] User " + userId + " cố truy cập admin path");
                    return this.onError(exchange, "Bạn không có quyền Admin", HttpStatus.FORBIDDEN);
                }

                // Mutate request: Gắn thêm header userId, role để các Service sau dùng luôn
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .header("x-user-id", String.valueOf(userId))
                        .header("x-user-role", role)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                logger.severe("[AUTH-FILTER] Token lỗi: " + e.getMessage());
                return this.onError(exchange, "Phiên đăng nhập hết hạn hoặc không hợp lệ", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    // Hàm trả về lỗi cho Client
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        logger.warning("[AUTH-FILTER] Rejecting request: " + err);
        exchange.getResponse().setStatusCode(httpStatus);
        // Trả về message tiếng Việt
        byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(bytes)));
    }

    // Hàm kiểm tra xem path có nằm trong danh sách public GET không
    private boolean isPublicGetPath(String path) {
        String cleanPath = path.split("\\?")[0]; // Bỏ query param nếu có
        return PUBLIC_ROOT_PATHS_FOR_GET.stream().anyMatch(endpoint -> {
            if (cleanPath.equals(endpoint)) {
                return true;
            }
            // Cho phép các path con, ví dụ /api/v1/recipes/123
            return cleanPath.startsWith(endpoint + "/");
        });
    }

    public static class Config {
    }
}