package com.dev.backend.dto.response;

import com.dev.backend.entity.HoSoKhach;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    String accessToken;
    String refreshToken;
    String email;
    String fullName;
    String phone;
    LocalDateTime lastLoginAt;
    List<String> vaiTro;
    HoSoKhach hoSoKhach;
}
