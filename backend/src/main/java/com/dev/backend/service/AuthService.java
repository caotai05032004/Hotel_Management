package com.dev.backend.service;

import com.dev.backend.dto.request.LoginRequest;
import com.dev.backend.dto.request.RegisterRequest;
import com.dev.backend.dto.response.AuthResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Nghiệp vụ xác thực (đăng ký, đăng nhập...).
 * Không kế thừa BaseService vì đây không phải CRUD của một entity.
 */
public interface AuthService {

    BaseResponse<AuthResponse> register(RegisterRequest request);

    BaseResponse<LoginResponse> login(LoginRequest request);
}
