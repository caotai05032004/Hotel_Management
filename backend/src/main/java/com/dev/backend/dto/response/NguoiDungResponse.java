package com.dev.backend.dto.response;

import com.dev.backend.constant.enums.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dữ liệu trả về cho client. KHÔNG trả entity NguoiDung trực tiếp vì
 * entity chứa passwordHash, verificationToken... và có quan hệ LAZY.
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NguoiDungResponse {
    String id;
    String email;
    String fullName;
    String phone;
    UserStatus status;
    List<String> roles;      // ["GUEST"]
    LocalDateTime createdAt;
}
