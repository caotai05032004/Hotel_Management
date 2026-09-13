package com.dev.backend.controller;

import com.dev.backend.dto.request.LoginRequest;
import com.dev.backend.dto.request.RegisterRequest;
import com.dev.backend.dto.response.AuthResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 3 & 4 — CONTROLLER: NƠI REQUEST "ĐÁP ĐẤT"
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Sau khi vượt qua filter chain (BƯỚC 2), DispatcherServlet dò bảng
 * HandlerMapping để tìm method khớp URL + HTTP method, rồi:
 *
 *   1. Jackson (HttpMessageConverter) đọc JSON trong body → dựng object
 *      LoginRequest / RegisterRequest  (nhờ @RequestBody)
 *   2. @Valid kích hoạt Jakarta Bean Validation trên các annotation
 *      @NotBlank / @Email / @Size / @Pattern khai báo trong DTO.
 *      Sai ràng buộc → ném MethodArgumentNotValidException → KHÔNG vào được
 *      thân hàm → GlobalExceptionHandler bắt và trả HTTP 400 kèm map lỗi
 *      {"errors": {"email": "Email không đúng định dạng"}}
 *   3. Thân hàm gọi xuống Service (BƯỚC 5).
 *
 * Vai trò của Controller chỉ có vậy: NHẬN – CHUYỂN – TRẢ.
 * Mọi logic nghiệp vụ nằm ở Service, không viết ở đây.
 *
 * Đường dẫn gốc: /api/auth
 * /api/auth/** đã được permitAll trong SecurityConfig nên không cần token.
 *
 * @RestController = @Controller + @ResponseBody → giá trị trả về được Jackson
 *                   serialize thẳng thành JSON, không đi tìm file view.
 * @RequiredArgsConstructor → Lombok sinh constructor cho field final,
 *                   Spring dùng constructor đó để inject AuthService.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;   // interface, Spring tiêm bản AuthServiceImpl

    /**
     * ĐĂNG KÝ  —  POST /api/auth/register
     *
     * Luồng đầy đủ:
     *   FE Register.tsx → authService.register()
     *     → POST /api/auth/register  body {email, password, fullName, phone}
     *       → [filter: permitAll, không cần token]
     *       → Jackson: JSON → RegisterRequest
     *       → @Valid: kiểm tra email đúng định dạng, mật khẩu 6–64 ký tự...
     *       → AuthServiceImpl.register(): check trùng email → băm mật khẩu
     *         → gán vai trò GUEST → INSERT nguoi_dung → sinh 2 token
     *       → trả BaseResponse{code:201, msg:"Đăng ký thành công", data:AuthResponse}
     *     ← FE lưu token vào localStorage, chuyển về trang chủ
     */
    @PostMapping("/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        BaseResponse<AuthResponse> data = authService.register(request);
        // ResponseEntity.ok(...) = HTTP 200. Lưu ý: mã nghiệp vụ (201/400/409)
        // nằm TRONG body ở field "code", không phải HTTP status.
        // Vì vậy frontend phải đọc body.code chứ không chỉ nhìn HTTP status
        // (xem hàm unwrap() trong src/services/http.ts).
        return ResponseEntity.ok(data);
    }

    /**
     * ĐĂNG NHẬP  —  POST /api/auth/login
     *
     *   FE Login.tsx → authService.login() → POST /api/auth/login {email, password}
     *     → AuthServiceImpl.login():
     *         SELECT nguoi_dung WHERE email = ?
     *         → passwordEncoder.matches(mật khẩu gõ, password_hash)
     *         → kiểm tra status == ACTIVE
     *         → sinh accessToken + refreshToken
     *         → cập nhật last_login_at
     *     → BaseResponse{code:200, data:LoginResponse{accessToken, email, fullName, vaiTro...}}
     *   ← FE: lưu token, giải mã claim "uid" lấy id, điều hướng theo vai trò
     *     (có ROLE nhân viên → /admin, còn lại → /)
     */
    @PostMapping("/login")
    public ResponseEntity<BaseResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        BaseResponse<LoginResponse> loginResponse = authService.login(request);
        return ResponseEntity.ok(loginResponse);
    }

    /**
     * ĐĂNG XUẤT  —  POST /api/auth/logout
     *
     * Không có @RequestBody: token lấy thẳng từ header.
     * @RequestHeader(required = false) → thiếu header cũng không lỗi 400,
     * để service tự trả thông báo "Token không hợp lệ" cho đồng nhất.
     *
     *   FE bấm "Đăng xuất" → axios gắn sẵn header Authorization
     *     → cắt tiền tố "Bearer " lấy token thô
     *     → AuthServiceImpl.logout(): đưa token vào TokenBlacklistService
     *       + SecurityContextHolder.clearContext()
     *   ← FE xoá localStorage, chuyển về /
     */
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);   // bỏ 7 ký tự "Bearer "
        }
        return ResponseEntity.ok(authService.logout(token));
    }
}
