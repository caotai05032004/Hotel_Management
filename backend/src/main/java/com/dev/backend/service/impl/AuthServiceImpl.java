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
import com.dev.backend.security.TokenBlacklistService;
import com.dev.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 5 — TẦNG NGHIỆP VỤ CHO XÁC THỰC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Controller chỉ chuyển tiếp; mọi quy tắc nghiệp vụ nằm ở đây:
 *   - email đã tồn tại chưa?
 *   - mật khẩu có khớp không?
 *   - tài khoản có bị khoá không?
 *   - sinh token như thế nào?
 *
 * @Service    → Spring tạo một bean singleton, tiêm vào AuthController.
 * @Transactional trên method → mở một transaction DB khi vào, commit khi ra.
 *   Nhờ đó Hibernate bật "dirty checking": chỉ cần setXxx() trên entity đang
 *   được quản lý (managed) là lúc commit tự sinh câu UPDATE, không cần save().
 *
 * @RequiredArgsConstructor   // Lombok tự sinh constructor cho các field final -> Spring inject
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;   // BCrypt, bean trong SecurityConfig
    private final NguoiDungMapper nguoiDungMapper;   // MapStruct: DTO ↔ Entity
    private final JwtTokenProvider jwtTokenProvider; // sinh access/refresh token
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * ┌──────────────────────────────────────────────────────────────────────┐
     * │ ĐĂNG KÝ — 5 chặng                                                    │
     * └──────────────────────────────────────────────────────────────────────┘
     * 1. Chuẩn hoá email về chữ thường (tránh A@x.com và a@x.com là 2 tài khoản)
     * 2. Kiểm tra trùng                → SELECT EXISTS(... WHERE email = ?)
     * 3. Lấy vai trò mặc định GUEST    → SELECT * FROM vai_tro WHERE code = 'GUEST'
     * 4. Map DTO → Entity, băm mật khẩu, INSERT
     * 5. Sinh token và dựng AuthResponse
     *
     * Ở đây dùng CommonException (ném ra) thay vì set code vào BaseResponse như
     * các service khác. GlobalExceptionHandler sẽ bắt và trả HTTP 409/500 thật.
     * → Frontend nhận HTTP 409, axios coi là lỗi, interceptor đọc body.msg.
     */
    @Override
    @Transactional
    public BaseResponse<AuthResponse> register(RegisterRequest request) {
        // 1. Chuẩn hoá dữ liệu đầu vào
        String email = request.getEmail().trim().toLowerCase();

        // 2. Email đã tồn tại -> 409
        if (nguoiDungRepository.existsByEmail(email)) {
            throw new CommonException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }

        // 3. Vai trò mặc định GUEST
        //    (bảng vai_tro phải có sẵn bản ghi code='GUEST', xem script trong thư mục database)
        VaiTro guestRole = vaiTroRepository.findByCode("GUEST")
                .orElseThrow(() -> new CommonException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Chưa có vai trò GUEST trong DB"));

        // 4. Request -> Entity, set đủ các trường rồi lưu
        //    Mapper bỏ qua passwordHash/status/roles (xem @Mapping(ignore) trong NguoiDungMapper)
        //    nên phải tự gán ở đây.
        NguoiDung nguoiDung = nguoiDungMapper.toEntity(request);
        nguoiDung.setEmail(email);
        // BCrypt tự sinh salt → cùng một mật khẩu vẫn ra hash khác nhau mỗi lần
        nguoiDung.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        nguoiDung.setStatus(UserStatus.ACTIVE);   // bỏ qua bước xác thực email
        nguoiDung.setRoles(new HashSet<>(Set.of(guestRole)));
        // save() → Hibernate sinh INSERT INTO nguoi_dung ... + INSERT nguoi_dung_vai_tro
        // id UUID do @UuidGenerator sinh phía ứng dụng, có ngay sau save()
        nguoiDungRepository.save(nguoiDung);

        // 5. Sinh token SAU KHI entity đã đầy đủ status + roles
        //    (nếu sinh trước thì claim "roles" sẽ rỗng, người dùng mất quyền)
        CustomUserDetails userDetails = CustomUserDetails.build(nguoiDung);
        AuthResponse data = AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateAccessToken(userDetails))
                .refreshToken(jwtTokenProvider.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                // toResponse() loại bỏ passwordHash, verificationToken... trước khi trả ra ngoài
                .user(nguoiDungMapper.toResponse(nguoiDung))
                .build();

        return BaseResponse.<AuthResponse>builder()
                .code(201)
                .msg("Đăng ký thành công")
                .data(data)
                .build();
        // → Controller bọc ResponseEntity.ok() → Jackson serialize → FE lưu token
    }

    /**
     * ┌──────────────────────────────────────────────────────────────────────┐
     * │ ĐĂNG NHẬP — 4 chặng kiểm tra rồi mới cấp token                       │
     * └──────────────────────────────────────────────────────────────────────┘
     *
     * Khác register: KHÔNG ném exception mà trả BaseResponse với code 400/403
     * bên trong body, HTTP status vẫn là 200.
     * → Frontend BẮT BUỘC đọc body.code, nếu chỉ dựa vào HTTP status thì sai
     *   mật khẩu vẫn bị coi là đăng nhập thành công (hàm unwrap() trong
     *   src/services/http.ts xử lý đúng chỗ này).
     */
    @Override
    @Transactional
    public BaseResponse<LoginResponse> login(LoginRequest request) {
        BaseResponse<LoginResponse> response = new BaseResponse<>();

        // 1. Tìm người dùng theo email  →  SELECT * FROM nguoi_dung WHERE email = ?
        NguoiDung nguoiDung = nguoiDungRepository
                .findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (nguoiDung == null) {
            response.setCode(400);
            response.setMsg("Sai tên đăng nhập hoặc mật khẩu");   // không nói rõ email không tồn tại
            return response;                                      // (tránh lộ email nào đã đăng ký)
        }

        // 2. So khớp mật khẩu.
        //    PHẢI dùng matches() vì BCrypt có salt ngẫu nhiên, encode() 2 lần ra 2 chuỗi khác nhau.
        //    matches() tự tách salt trong hash rồi băm lại mật khẩu gõ vào để so sánh.
        boolean checkPassword = passwordEncoder.matches(request.getPassword(), nguoiDung.getPasswordHash());
        if (!checkPassword) {
            response.setCode(400);
            response.setMsg("Sai tên đăng nhập hoặc mật khẩu");
            return response;
        }

        // 3. Tài khoản phải đang hoạt động (không LOCKED / PENDING_VERIFICATION / ANONYMIZED)
        if (nguoiDung.getStatus() != UserStatus.ACTIVE) {
            response.setCode(403);
            response.setMsg("Tài khoản chưa kích hoạt hoặc đã bị khóa");
            return response;
        }

        // 4. Hợp lệ → cấp token
        // Sinh token: JwtTokenProvider nhận CustomUserDetails, không nhận email
        CustomUserDetails userDetails = CustomUserDetails.build(nguoiDung);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        // Không gọi save(): entity đang được Hibernate quản lý trong transaction,
        // đổi giá trị là lúc commit tự sinh UPDATE nguoi_dung SET last_login_at = ?
        nguoiDung.setLastLoginAt(LocalDateTime.now());   // @Transactional nên tự UPDATE khi kết thúc

        // Dựng DTO trả về. Lưu ý KHÔNG có field id —
        // frontend phải giải mã claim "uid" trong accessToken để biết id (src/lib/jwt.ts).
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setAccessToken(accessToken);
        loginResponse.setRefreshToken(refreshToken);
        loginResponse.setEmail(nguoiDung.getEmail());
        loginResponse.setFullName(nguoiDung.getFullName());
        loginResponse.setPhone(nguoiDung.getPhone());
        // Set<VaiTro> → List<String> ["GUEST"] để FE so sánh vai trò và điều hướng
        loginResponse.setVaiTro(nguoiDung.getRoles().stream().map(VaiTro::getCode).toList()); // List<String>
        loginResponse.setLastLoginAt(nguoiDung.getLastLoginAt());

        response.setCode(200);
        response.setMsg("Đăng nhập thành công");
        response.setData(loginResponse);
        return response;
    }

    /**
     * ┌──────────────────────────────────────────────────────────────────────┐
     * │ ĐĂNG XUẤT — vô hiệu hoá token phía server                            │
     * └──────────────────────────────────────────────────────────────────────┘
     * JWT không thể "thu hồi" nên cách duy nhất là ghi token vào danh sách đen
     * cho tới khi nó hết hạn tự nhiên. Từ lần gọi API kế tiếp,
     * JwtAuthenticationFilter thấy token nằm trong blacklist → không cấp quyền → 401.
     *
     * Không có @Transactional vì không đụng tới database.
     */
    @Override
    public BaseResponse<Void> logout(String token) {
        BaseResponse<Void> response = new BaseResponse<>();

        // Token rỗng hoặc sai chữ ký/hết hạn thì không cần (và không thể) blacklist
        if (StringUtils.isEmpty(token) || !jwtTokenProvider.validateToken(token)) {
            response.setCode(400);
            response.setMsg("Token không hợp lệ");
            return response;
        }

        // Lưu kèm thời điểm hết hạn để blacklist tự dọn rác về sau
        tokenBlacklistService.add(token, jwtTokenProvider.getExpirationFromJWT(token));

        // Xoá Authentication khỏi ThreadLocal của chính request này
        SecurityContextHolder.clearContext();

        response.setCode(200);
        response.setMsg("Đăng xuất thành công");
        return response;
    }
}
