package com.dev.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ĐIỂM BẮT ĐẦU CỦA ỨNG DỤNG  —  BƯỚC 0 trong vòng đời một request
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Toàn bộ luồng một request đi qua hệ thống (đọc file FLOW.md để xem bản đầy đủ):
 *
 *   [0] BackendApplication.main()
 *         └─ Spring Boot khởi động, quét package com.dev.backend, tạo toàn bộ bean
 *            (@RestController, @Service, @Repository, @Component, @Configuration)
 *            rồi bật Tomcat nhúng ở cổng 8080 (server.port trong application.yml).
 *
 *   [1] Trình duyệt (React ở localhost:5173) gọi fetch('/api/...')
 *         └─ Vite proxy chuyển tiếp sang http://localhost:8080/api/...
 *
 *   [2] Tomcat nhận gói HTTP  →  Servlet Filter Chain của Spring Security
 *         ├─ CorsFilter                → kiểm tra Origin có nằm trong danh sách cho phép
 *         ├─ JwtAuthenticationFilter   → đọc header Authorization, xác thực token,
 *         │                              nạp CustomUserDetails vào SecurityContext
 *         └─ FilterSecurityInterceptor → so URL với luật trong SecurityConfig
 *                                        (permitAll / authenticated)
 *
 *   [3] DispatcherServlet  →  tìm @RequestMapping khớp URL + HTTP method
 *         └─ Chọn đúng method trong Controller
 *
 *   [4] Trước khi vào Controller:
 *         ├─ HttpMessageConverter (Jackson) đổi JSON body  →  DTO Request
 *         ├─ @Valid chạy jakarta.validation trên DTO (nếu sai → ném
 *         │  MethodArgumentNotValidException, GlobalExceptionHandler bắt, trả 400)
 *         └─ @PreAuthorize kiểm tra vai trò (nếu sai → AccessDeniedException, trả 403)
 *
 *   [5] Controller gọi Service (tầng nghiệp vụ)
 *         └─ Service mở @Transactional, kiểm tra nghiệp vụ, gọi Repository
 *
 *   [6] Repository (Spring Data JPA)  →  Hibernate sinh câu SQL  →  MySQL
 *         └─ Kết quả ResultSet được Hibernate map ngược về Entity
 *
 *   [7] Service dùng MapStruct Mapper đổi Entity  →  DTO Response
 *         └─ Bọc trong BaseResponse{code, msg, data} rồi trả về Controller
 *
 *   [8] Controller trả ResponseEntity  →  Jackson serialize thành JSON
 *         └─ Tomcat ghi JSON xuống socket
 *
 *   [9] Frontend: axios interceptor trong src/services/http.ts nhận JSON,
 *       hàm unwrap() bóc BaseResponse → React setState → render ra màn hình.
 *
 * ════════════════════════════════════════════════════════════════════════════
 *
 * @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
 *      → tự quét mọi class có annotation trong package com.dev.backend và các package con.
 * @EnableJpaAuditing = bật cơ chế tự điền createdBy / createdDate nếu entity dùng
 *      @CreatedDate, @LastModifiedDate của Spring Data.
 */
@SpringBootApplication
@EnableJpaAuditing
public class BackendApplication {

    public static void main(String[] args) {
        // Dòng này dựng ApplicationContext, tạo tất cả bean rồi start Tomcat.
        // Sau khi in "Started BackendApplication in x.xxx seconds" là sẵn sàng nhận request.
        SpringApplication.run(BackendApplication.class, args);
    }
}
