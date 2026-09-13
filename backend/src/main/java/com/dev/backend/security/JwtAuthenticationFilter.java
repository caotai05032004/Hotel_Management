package com.dev.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 2.2 — BỘ LỌC JWT: "ANH LÀ AI?"
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Chạy MỘT LẦN cho mỗi request (OncePerRequestFilter), NGAY TRƯỚC khi
 * Spring Security kiểm tra quyền truy cập URL.
 *
 * Nhiệm vụ duy nhất: nếu request mang theo token hợp lệ thì đặt đối tượng
 * Authentication vào SecurityContextHolder. KHÔNG tự trả lỗi 401 — việc chặn
 * là của FilterSecurityInterceptor phía sau.
 *
 * Quy trình 6 bước bên trong doFilterInternal():
 *   (a) SecurityContext đã có Authentication rồi?  → bỏ qua, đi tiếp.
 *   (b) Lấy chuỗi token từ header "Authorization: Bearer <token>".
 *   (c) Kiểm tra chữ ký + hạn dùng   → JwtTokenProvider.validateToken()
 *   (d) Kiểm tra token đã logout chưa → TokenBlacklistService.isBlacklisted()
 *   (e) Lấy email (claim "sub") trong token → truy vấn DB lấy user + vai trò
 *   (f) Tạo UsernamePasswordAuthenticationToken và đặt vào SecurityContextHolder
 *
 * Sau bước (f), ở BƯỚC 4 các annotation @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
 * mới có dữ liệu để so sánh.
 *
 * SecurityContextHolder lưu theo ThreadLocal → mỗi request một luồng riêng,
 * dữ liệu không lẫn giữa các người dùng. Spring tự dọn sau khi request kết thúc.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;               // ký / giải mã / kiểm tra JWT
    private final CustomUserDetailsService customUserDetailsService; // nạp user từ bảng nguoi_dung
    private final TokenBlacklistService tokenBlacklistService;      // danh sách token đã logout

    /**
     * Bóc chuỗi token ra khỏi header.
     * Header FE gửi lên:  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9....
     * substring(7) = cắt bỏ đúng 7 ký tự "Bearer ".
     * Không có header hoặc sai định dạng → trả null → request coi như ẩn danh.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // (a) Đã xác thực từ bộ lọc khác rồi thì không làm lại, tránh ghi đè.
        // Da xac thuc tu bo loc khac thi bo qua
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);   // chuyển sang filter kế tiếp
            return;
        }

        try {
            // (b) Lấy token ra khỏi header
            String jwt = getJwtFromRequest(request);

            // (c) + (d): token phải có, chữ ký đúng, chưa hết hạn, và chưa bị logout
            if (StringUtils.hasText(jwt)
                    && jwtTokenProvider.validateToken(jwt)
                    && !tokenBlacklistService.isBlacklisted(jwt)) {

                // (e) claim "sub" của token chính là email → truy vấn DB
                //     (mỗi request có token sẽ tốn 1 câu SELECT nguoi_dung + vai_tro;
                //      muốn bỏ query này thì đọc thẳng claim "roles" trong token)
                String email = jwtTokenProvider.getEmailFromJWT(jwt);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                // Tài khoản bị khoá / chưa kích hoạt thì không cấp quyền
                // (CustomUserDetails.isEnabled() trả true khi status == ACTIVE)
                if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {

                    // (f) Dựng đối tượng Authentication:
                    //     - principal    = userDetails (chứa id, email, danh sách quyền)
                    //     - credentials  = null (không giữ mật khẩu trong bộ nhớ)
                    //     - authorities  = ["ROLE_GUEST"], ["ROLE_MANAGER"]...
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    // Gắn thêm IP + session id để ghi log / audit
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // Đặt vào ThreadLocal — từ đây trở đi toàn bộ request "biết" người gọi là ai.
                    // @PreAuthorize và SecurityContextHolder.getContext().getAuthentication()
                    // ở tầng Service đều đọc từ chỗ này.
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            // Token rác, user đã bị xoá, DB lỗi... đều rơi vào đây.
            // Khong nem exception ra ngoai: de EntryPoint tra 401 thay vi 500.
            // Dung debug thay vi error, tranh spam log voi moi request an danh.
            SecurityContextHolder.clearContext();
            log.debug("Khong thiet lap duoc xac thuc cho request {}: {}",
                    request.getRequestURI(), ex.getMessage());
        }

        // LUÔN đi tiếp. Nếu SecurityContext vẫn rỗng và URL yêu cầu đăng nhập,
        // FilterSecurityInterceptor phía sau sẽ trả 401 — không phải việc của filter này.
        filterChain.doFilter(request, response);
    }
}
