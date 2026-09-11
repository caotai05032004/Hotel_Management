package com.dev.backend.service.impl;

import com.dev.backend.constant.enums.UserStatus;
import com.dev.backend.dto.request.LoginRequest;
import com.dev.backend.dto.request.RegisterRequest;
import com.dev.backend.dto.response.AuthResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.entity.NguoiDung;
import com.dev.backend.entity.VaiTro;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.repository.VaiTroRepository;
import com.dev.backend.security.CustomUserDetails;
import com.dev.backend.security.JwtTokenProvider;
import com.dev.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor   // Lombok tự sinh constructor cho các field final -> Spring inject
public class AuthServiceImpl implements AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;   // BCrypt, bean trong SecurityConfig
    private final NguoiDungMapper nguoiDungMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public BaseResponse<AuthResponse> register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 2. Email đã tồn tại -> 409
        if (nguoiDungRepository.existsByEmail(email)) {
            throw new CommonException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }

        // 3. Vai trò mặc định GUEST
        VaiTro guestRole = vaiTroRepository.findByCode("GUEST")
                .orElseThrow(() -> new CommonException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Chưa có vai trò GUEST trong DB"));

        // 4. Request -> Entity, set đủ các trường rồi lưu
        NguoiDung nguoiDung = nguoiDungMapper.toEntity(request);
        nguoiDung.setEmail(email);
        nguoiDung.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        nguoiDung.setStatus(UserStatus.ACTIVE);
        nguoiDung.setRoles(new HashSet<>(Set.of(guestRole)));
        nguoiDungRepository.save(nguoiDung);

        // 5. Sinh token SAU KHI entity đã đầy đủ status + roles
        CustomUserDetails userDetails = CustomUserDetails.build(nguoiDung);
        AuthResponse data = AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateAccessToken(userDetails))
                .refreshToken(jwtTokenProvider.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                .user(nguoiDungMapper.toResponse(nguoiDung))
                .build();

        return BaseResponse.<AuthResponse>builder()
                .code(201)
                .msg("Đăng ký thành công")
                .data(data)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<LoginResponse> login(LoginRequest request) {
        BaseResponse<LoginResponse> response = new BaseResponse<>();

        NguoiDung nguoiDung = nguoiDungRepository
                .findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (nguoiDung == null) {
            response.setCode(400);
            response.setMsg("Sai tên đăng nhập hoặc mật khẩu");   // không nói rõ email không tồn tại
            return response;
        }

        boolean checkPassword = passwordEncoder.matches(request.getPassword(), nguoiDung.getPasswordHash());
        if (!checkPassword) {
            response.setCode(400);
            response.setMsg("Sai tên đăng nhập hoặc mật khẩu");
            return response;
        }

        if (nguoiDung.getStatus() != UserStatus.ACTIVE) {
            response.setCode(403);
            response.setMsg("Tài khoản chưa kích hoạt hoặc đã bị khóa");
            return response;
        }

        // Sinh token: JwtTokenProvider nhận CustomUserDetails, không nhận email
        CustomUserDetails userDetails = CustomUserDetails.build(nguoiDung);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        nguoiDung.setLastLoginAt(LocalDateTime.now());   // @Transactional nên tự UPDATE khi kết thúc

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setAccessToken(accessToken);
        loginResponse.setRefreshToken(refreshToken);
        loginResponse.setEmail(nguoiDung.getEmail());
        loginResponse.setFullName(nguoiDung.getFullName());
        loginResponse.setPhone(nguoiDung.getPhone());
        loginResponse.setVaiTro(nguoiDung.getRoles().stream().map(VaiTro::getCode).toList()); // List<String>
        loginResponse.setLastLoginAt(nguoiDung.getLastLoginAt());

        response.setCode(200);
        response.setMsg("Đăng nhập thành công");
        response.setData(loginResponse);
        return response;
    }
}