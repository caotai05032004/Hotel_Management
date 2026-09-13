package com.dev.backend.config;

import com.dev.backend.security.CustomUserDetailsService;
import com.dev.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 2 — CỔNG VÀO CỦA MỌI REQUEST: SPRING SECURITY FILTER CHAIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Đây là file quyết định "request nào được đi tiếp, request nào bị chặn".
 * Request CHƯA hề chạm tới Controller ở bước này.
 *
 * Thứ tự các filter mà một request phải đi qua:
 *
 *   Tomcat
 *     ↓
 *   CorsFilter                    ← corsConfigurationSource() bên dưới
 *     ↓                             (trình duyệt gửi preflight OPTIONS trước mọi
 *                                    request POST/PUT/PATCH/DELETE có header lạ)
 *   JwtAuthenticationFilter       ← ta tự cắm vào bằng addFilterBefore(...)
 *     ↓                             đọc "Authorization: Bearer xxx", xác thực,
 *                                   đặt Authentication vào SecurityContextHolder
 *   UsernamePasswordAuthenticationFilter (mặc định, ở đây không dùng form login)
 *     ↓
 *   FilterSecurityInterceptor     ← authorizeHttpRequests(...) bên dưới
 *     ↓                             so URL với PUBLIC_ENDPOINTS / anyRequest()
 *   DispatcherServlet → Controller  (BƯỚC 3)
 *
 * Ba annotation ở đầu class:
 *   @Configuration      → class chứa các @Bean, Spring đọc lúc khởi động.
 *   @EnableWebSecurity  → bật filter chain của Spring Security.
 *   @EnableMethodSecurity → bật @PreAuthorize trên từng method Controller/Service
 *                           (chặn theo VAI TRÒ, chạy ở BƯỚC 4 — sau khi đã xác thực).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // bat @PreAuthorize tren service/controller
@RequiredArgsConstructor
public class SecurityConfig {

    // Hai bean này do Spring tự inject (nhờ @RequiredArgsConstructor sinh constructor)
    private final JwtAuthenticationFilter jwtAuthenticationFilter;     // bộ lọc JWT tự viết
    private final CustomUserDetailsService customUserDetailsService;   // nạp user từ DB

    /** Đọc từ application.yml: app.cors.allowed-origins = http://localhost:5173 */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Các URL KHÔNG cần token. Mọi URL khác đều phải đăng nhập.
     * Lưu ý: đây là so khớp theo ĐƯỜNG DẪN, không phân biệt HTTP method.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",        // đăng ký / đăng nhập / đăng xuất
            "/v3/api-docs/**",     // OpenAPI JSON cho Swagger
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/health"
    };

    /**
     * Thuật toán băm mật khẩu. Dùng ở 2 chỗ:
     *   - AuthServiceImpl.register()  : encode(mật khẩu người dùng) → lưu vào cột password_hash
     *   - AuthServiceImpl.login()     : matches(mật khẩu gõ vào, hash trong DB)
     * BCrypt tự sinh salt ngẫu nhiên nên 2 lần encode cùng 1 chuỗi cho ra 2 hash khác nhau
     * → BẮT BUỘC dùng matches() để so sánh, không được so bằng equals().
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager — hiện dự án KHÔNG dùng tới trong luồng login
     * (AuthServiceImpl tự gọi passwordEncoder.matches thủ công), nhưng vẫn khai báo
     * sẵn để sau này chuyển sang cách chuẩn authenticationManager.authenticate(...).
     *
     * Dung DaoAuthenticationProvider tuong minh thay vi AuthenticationConfiguration:
     * ro rang hon va tranh phu thuoc vao bean UserDetailsService duoc do tim tu dong.
     */
    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    /**
     * CẤU HÌNH CORS — chạy TRƯỚC tất cả, ngay khi Tomcat nhận gói tin.
     *
     * Vì FE (localhost:5173) và BE (localhost:8080) khác cổng → khác Origin →
     * trình duyệt coi là "cross-origin". Trước mỗi request "không đơn giản"
     * (có header Authorization, Content-Type: application/json, method PUT/PATCH/DELETE)
     * trình duyệt tự gửi một request OPTIONS "preflight" để hỏi server có cho phép không.
     * Nếu server không trả đúng các header Access-Control-Allow-* thì trình duyệt
     * CHẶN ngay, FE sẽ thấy lỗi "Network Error" dù backend hoàn toàn bình thường.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Danh sách origin được phép, tách bằng dấu phẩy trong application.yml
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList());

        // Các HTTP method FE được dùng
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép mọi header (quan trọng nhất là Authorization và Content-Type)
        configuration.setAllowedHeaders(List.of("*"));

        // Cho phép JS phía FE ĐỌC được header Authorization trong response
        configuration.setExposedHeaders(List.of("Authorization"));

        // Cho phép gửi kèm cookie / credential
        configuration.setAllowCredentials(true);

        // Trình duyệt được cache kết quả preflight 1 giờ → đỡ phải hỏi lại liên tục
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);   // áp cho mọi đường dẫn
        return source;
    }

    /**
     * TRÁI TIM CỦA BẢO MẬT — định nghĩa chuỗi filter mà mọi request phải đi qua.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt CSRF: API REST dùng JWT (stateless), không dùng cookie session
                //    nên không có nguy cơ CSRF cổ điển. Nếu bật, mọi POST/PUT/DELETE
                //    từ FE sẽ bị 403 vì thiếu CSRF token.
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Gắn cấu hình CORS ở trên vào filter chain
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. STATELESS: server KHÔNG tạo HttpSession, không nhớ ai đang đăng nhập.
                //    Mỗi request phải tự mang theo JWT. Đây là lý do FE phải gắn
                //    header Authorization ở MỌI lời gọi (xem http.ts interceptor).
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Bảng luật phân quyền theo URL — duyệt từ TRÊN XUỐNG, khớp cái nào dừng cái đó
                .authorizeHttpRequests(authorize -> authorize

                        // 4.1 Mọi request OPTIONS (preflight của trình duyệt) luôn cho qua,
                        //     nếu chặn thì FE không gọi được bất cứ API nào
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 4.2 Đăng ký / đăng nhập / Swagger: không cần token
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // 4.3 Khách vãng lai được XEM catalog (chỉ method GET)
                        //     ⚠ LƯU Ý: danh sách hạng phòng phía FE gọi bằng
                        //     POST /api/hang-phong/filter → KHÔNG khớp luật GET này
                        //     → rơi xuống 4.4 → bị 401.
                        //     Muốn khách xem được danh sách thì thêm dòng:
                        //       .requestMatchers(HttpMethod.POST, "/api/hang-phong/filter").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/hang-phong/**",
                                "/api/tours/**",
                                "/api/mon-an/**").permitAll()

                        // 4.4 Tất cả URL còn lại: bắt buộc đã xác thực.
                        //     Nếu SecurityContext rỗng (không có token hợp lệ) → 401.
                        //     Việc kiểm tra VAI TRÒ chi tiết nằm ở @PreAuthorize trên Controller.
                        .anyRequest().authenticated()
                );

        // 5. Cắm JwtAuthenticationFilter vào TRƯỚC UsernamePasswordAuthenticationFilter.
        //    Phải đứng trước thì lúc FilterSecurityInterceptor (bước 4) kiểm tra quyền,
        //    SecurityContext mới đã có sẵn Authentication.
        //    BAT BUOC: thieu dong nay thi toan bo JWT khong co tac dung
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
