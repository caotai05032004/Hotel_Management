package com.dev.backend.controller;

import com.dev.backend.dto.request.UpdateNguoiDungRequest;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.service.entities.NguoiDungService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONTROLLER NGƯỜI DÙNG  —  /api/user
 * ════════════════════════════════════════════════════════════════════════════
 *
 * KHÔNG nằm trong PUBLIC_ENDPOINTS → rơi vào luật `.anyRequest().authenticated()`
 * ở SecurityConfig → mọi request tới đây BẮT BUỘC có JWT hợp lệ, nếu không thì
 * bị chặn từ BƯỚC 2, chưa kịp vào Controller đã bị trả 401.
 *
 * Controller này không có @PreAuthorize → bất kỳ ai đã đăng nhập (kể cả GUEST)
 * đều gọi được. ⚠ Nghĩa là user A có thể xem/sửa hồ sơ user B nếu biết id/email.
 * Muốn siết lại nên thêm:
 *     @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    /**
     * XEM HỒ SƠ  —  GET /api/user/user/{id}
     *
     * @PathVariable lấy đoạn {id} trên URL (UUID 36 ký tự trong bảng nguoi_dung).
     *
     *   FE Profile.tsx: LoginResponse không trả id, nên FE giải mã claim "uid"
     *   trong access token (src/lib/jwt.ts) rồi gọi endpoint này.
     *     → NguoiDungService.userDetail(id)
     *       → getOne(id) = repository.findById(id)  →  SELECT * FROM nguoi_dung WHERE id = ?
     *       → NguoiDungMapper.toResponse(entity)    →  bỏ passwordHash, đổi Set<VaiTro> → List<String>
     *     ← BaseResponse{code:200, data:NguoiDungResponse}
     *
     * (Đường dẫn bị lặp chữ "user": /api/user + /user/{id}. Đổi thành @GetMapping("/{id}")
     *  thì FE chỉ cần sửa một dòng trong nguoiDungService.ts.)
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<BaseResponse<NguoiDungResponse>> userDetail(@PathVariable String id) {
        return ResponseEntity.ok(nguoiDungService.userDetail(id));
    }

    /**
     * CẬP NHẬT HỒ SƠ  —  POST /api/user/update
     *
     * Định danh người cần sửa bằng EMAIL trong body (không phải id trên URL),
     * nên email không thể đổi qua endpoint này.
     *
     *   FE Profile.tsx / admin/TaiKhoanPage.tsx gửi {email, fullName, phone, password}
     *     → NguoiDungService.update():
     *         findByEmail → set fullName/phone → passwordEncoder.encode(password)
     *     ← BaseResponse{code:200, data:NguoiDungResponse}
     *
     * ⚠ Service LUÔN encode lại mật khẩu → FE buộc phải nhập mật khẩu mới mỗi lần
     *   cập nhật, nếu không mật khẩu sẽ bị đặt thành chuỗi rỗng đã băm.
     */
    @PostMapping("/update")
    public ResponseEntity<BaseResponse<NguoiDungResponse>> updateUser(@Valid @RequestBody UpdateNguoiDungRequest request){
        return ResponseEntity.ok(nguoiDungService.update(request));
    }
}
