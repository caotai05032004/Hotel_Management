package com.dev.backend.security;

import com.dev.backend.constant.enums.UserStatus;
import com.dev.backend.entity.NguoiDung;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  "CHỨNG MINH THƯ" CỦA NGƯỜI DÙNG TRONG SUỐT MỘT REQUEST
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Spring Security chỉ làm việc với giao diện UserDetails. Class này là bản
 * hiện thực của ta, đóng vai trò "principal" — tức là đối tượng nằm trong
 * SecurityContextHolder từ lúc JwtAuthenticationFilter đặt vào (BƯỚC 2.2)
 * cho đến khi request kết thúc.
 *
 * Nó được dùng ở 3 nơi:
 *   1. JwtAuthenticationFilter  → nạp vào SecurityContext mỗi request có token
 *   2. JwtTokenProvider         → đọc getId() / getUsername() / getAuthorities()
 *                                 để nhét vào claim khi SINH token lúc đăng nhập
 *   3. @PreAuthorize("hasAnyRole('MANAGER','ADMIN')") → đọc getAuthorities()
 *
 * KHÔNG chứa thông tin thừa (họ tên, số điện thoại…) — chỉ đủ để xác thực & phân quyền.
 */
@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    /**
     * id cua NguoiDung la CHAR(36) UUID -> String, khong phai java.util.UUID.
     * Giá trị này được nhét vào claim "uid" của JWT, và frontend giải mã token
     * để lấy id gọi GET /api/user/user/{id} (vì LoginResponse không trả id).
     */
    private final String id;

    /** Đóng vai trò "username" của Spring Security. Là khoá tra cứu trong DB. */
    private final String email;

    /** Mật khẩu ĐÃ BĂM BCrypt. Không bao giờ là mật khẩu thô. */
    private final String password;

    /** ACTIVE / LOCKED / PENDING_VERIFICATION / ANONYMIZED — quyết định 4 hàm isXxx() bên dưới. */
    private final UserStatus status;

    /** Danh sách quyền, dạng ["ROLE_GUEST"] hoặc ["ROLE_MANAGER", "ROLE_ADMIN"]. */
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Chuyen NguoiDung -> UserDetails.
     * Quan he vai tro di qua bang trung gian nguoi_dung_vai_tro, nen phai duyet
     * qua NguoiDungVaiTro. Goi trong transaction hoac dung repository co fetch join,
     * neu khong se dinh LazyInitializationException.
     *
     * ⚠ TIỀN TỐ "ROLE_" LÀ BẮT BUỘC: trong DB bảng vai_tro lưu code = "MANAGER",
     * nhưng hasRole('MANAGER') của Spring Security ngầm so sánh với "ROLE_MANAGER".
     * Thiếu tiền tố này thì mọi @PreAuthorize đều trả 403.
     */
    public static CustomUserDetails build(NguoiDung nguoiDung) {
        List<GrantedAuthority> authorities = nguoiDung.getRoles().stream()
                .map(vaiTro -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + vaiTro.getCode()))
                .toList();

        return new CustomUserDetails(
                nguoiDung.getId(),
                nguoiDung.getEmail(),
                nguoiDung.getPasswordHash(),
                nguoiDung.getStatus(),
                authorities
        );
    }

    /* ───────── 6 hàm bắt buộc của giao diện UserDetails ───────── */

    /** Spring Security đọc hàm này khi đánh giá hasRole / hasAnyRole / hasAuthority. */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /** Chỉ dùng khi so khớp mật khẩu bằng DaoAuthenticationProvider. */
    @Override
    public String getPassword() {
        return password;
    }

    /** "Tên đăng nhập" của hệ thống này là email. */
    @Override
    public String getUsername() {
        return email;
    }

    /** Tài khoản đã ẩn danh hoá (xoá dữ liệu theo yêu cầu GDPR) thì coi như hết hiệu lực. */
    @Override
    public boolean isAccountNonExpired() {
        return status != UserStatus.ANONYMIZED;
    }

    /** JwtAuthenticationFilter kiểm tra hàm này trước khi cấp quyền. */
    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.LOCKED;
    }

    /** Dự án chưa có chính sách bắt đổi mật khẩu định kỳ → luôn true. */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Chi tai khoan da xac thuc email moi duoc dang nhap.
     * Đây là hàm JwtAuthenticationFilter gọi; PENDING_VERIFICATION sẽ trả false
     * → request coi như ẩn danh → 401.
     */
    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
