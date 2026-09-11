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

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    /**
     * id cua NguoiDung la CHAR(36) UUID -> String, khong phai java.util.UUID.
     */
    private final String id;
    private final String email;
    private final String password;
    private final UserStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Chuyen NguoiDung -> UserDetails.
     * Quan he vai tro di qua bang trung gian nguoi_dung_vai_tro, nen phai duyet
     * qua NguoiDungVaiTro. Goi trong transaction hoac dung repository co fetch join,
     * neu khong se dinh LazyInitializationException.
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return status != UserStatus.ANONYMIZED;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.LOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Chi tai khoan da xac thuc email moi duoc dang nhap.
     */
    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
