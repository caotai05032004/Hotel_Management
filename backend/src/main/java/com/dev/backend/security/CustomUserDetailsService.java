package com.dev.backend.security;

import com.dev.backend.entity.NguoiDung;
import com.dev.backend.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 2.3 — CẦU NỐI GIỮA SPRING SECURITY VÀ BẢNG nguoi_dung
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Spring Security không biết gì về bảng của ta. Nó chỉ biết giao diện
 * UserDetailsService với đúng một hàm: "cho tôi user theo username".
 * Ở dự án này "username" chính là EMAIL.
 *
 * Ai gọi hàm này?
 *   1. JwtAuthenticationFilter — mỗi request có token (BƯỚC 2.2)
 *   2. DaoAuthenticationProvider — nếu sau này dùng authenticationManager.authenticate()
 *
 * SQL sinh ra: SELECT * FROM nguoi_dung WHERE email = ?
 *              + SELECT ... FROM nguoi_dung_vai_tro JOIN vai_tro ... (lấy roles)
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    // readOnly = true: Hibernate không cần theo dõi thay đổi (dirty checking) → nhanh hơn.
    // @Transactional còn giữ Session mở để nạp được quan hệ LAZY roles bên trong
    // CustomUserDetails.build(), nếu không sẽ dính LazyInitializationException.
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Khong tim thay nguoi dung voi email: " + email));

        // Đổi entity của mình → đối tượng mà Spring Security hiểu được
        return CustomUserDetails.build(nguoiDung);
    }
}
