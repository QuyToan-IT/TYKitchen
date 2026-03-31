# Bếp CỦA TY (TY's Kitchen) - Fullstack Cooking Platform

**Bếp CỦA TY** là một hệ thống hướng dẫn nấu ăn hiện đại, được xây dựng trên kiến trúc **Microservices**. Dự án không chỉ cung cấp công thức nấu ăn mà còn tích hợp trí tuệ nhân tạo (AI) để hỗ trợ người dùng sáng tạo nội dung ẩm thực.

---

## Tính năng nổi bật

*   **Kiến trúc Microservices:** Hệ thống được chia nhỏ thành các dịch vụ độc lập, giúp dễ dàng mở rộng và bảo trì.
*   **AI Assistant:** Tích hợp **Gemini API** để tự động tạo nội dung, gợi ý công thức và hỗ trợ người dùng trong quá trình nấu nướng.
*   **Quản lý công thức:** Tìm kiếm, xem chi tiết và lưu trữ các công thức nấu ăn đa dạng.
*   **Xác thực bảo mật:** Sử dụng **JWT (JSON Web Token)** để quản lý phiên đăng nhập và phân quyền người dùng.
*   **Giao diện hiện đại:** Responsive Design, tối ưu hóa trải nghiệm trên cả Desktop và Mobile.

---

## Công nghệ sử dụng

### Backend (Microservices)
*   **Java Spring Boot:** Framework chính để xây dựng các service.
*   **Spring Cloud:** Quản lý Service Discovery (Eureka), API Gateway và Config.
*   **MySQL:** Cơ sở dữ liệu quan hệ mạnh mẽ.
*   **Spring Security & JWT:** Bảo mật hệ thống.

### Frontend
*   **React.js:** Xây dựng giao diện người dùng linh hoạt và hiệu năng cao.
*   **Tailwind CSS:** Thiết kế UI nhanh chóng và hiện đại.
*   **Axios:** Xử lý các yêu cầu HTTP đến API.

### Công nghệ khác
*   **Google Gemini API:** Xử lý ngôn ngữ tự nhiên cho trợ lý ảo.
*   **Docker:** Đóng gói và triển khai ứng dụng.

---

## Cấu trúc dự án

Hệ thống được chia thành các dịch vụ độc lập nằm trong thư mục `backend/`:

1.  **api-gateway**: Điểm đầu vào duy nhất, điều hướng các request từ client đến các service tương ứng.
2.  **discovery-service**: Sử dụng Netflix Eureka để quản lý việc đăng ký và phát hiện các dịch vụ trong hệ thống.
3.  **user-service**: Quản lý thông tin người dùng, xác thực và phân quyền (JWT).
4.  **recipe-service**: Nghiệp vụ chính về quản lý công thức nấu ăn.
5.  **article-service**: Quản lý các bài viết và nội dung hướng dẫn chia sẻ.
6.  **interaction-service**: Xử lý các tương tác của người dùng như đánh giá, bình luận.

---

## Cài đặt và Chạy thử

### Yêu cầu hệ thống
*   Java 17+
*   Node.js & npm
*   MySQL Server

### Các bước thực hiện

1.  **Clone repository:**
    ```bash
    git clone https://github.com/QuyToan-IT/TYKitchen.git
    ```

2.  **Cấu hình Database:**
    *   Tạo database MySQL.
    *   Cập nhật thông tin kết nối trong file `application.yml` hoặc `application.properties` của từng service.

3.  **Chạy Backend:**
    *   Chạy **Discovery Service** trước, sau đó đến các service còn lại.
    ```bash
    ./mvnw spring-boot:run
    ```

4.  **Chạy Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

---

## Giấy phép

Dự án này thuộc bản quyền của nhóm phát triển **Bếp CỦA TY**.

---
*Cảm ơn bạn đã ghé thăm repository này!*
