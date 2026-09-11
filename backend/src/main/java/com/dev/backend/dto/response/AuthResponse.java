package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    String accessToken;
    String refreshToken;
    String tokenType;            // "Bearer"
    NguoiDungResponse user;
}
