package com.dev.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Dữ liệu client gửi lên khi đăng ký.
 * Các annotation jakarta.validation sẽ được kiểm tra tự động nhờ @Valid ở controller;
 * sai thì GlobalExceptionHandler trả 400 kèm tên trường bị lỗi.
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 190)
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 64, message = "Mật khẩu phải từ 6 đến 64 ký tự")
    String password;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 150)
    String fullName;

    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
    String phone;   // không bắt buộc, nhưng nếu có thì phải đúng dạng
}
