package com.dev.backend.controller;

import com.dev.backend.dto.request.AnhHangPhongRequest;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.HangPhongRequest;
import com.dev.backend.dto.response.AnhHangPhongResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.HangPhongResponse;
import com.dev.backend.service.HangPhongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONTROLLER HẠNG PHÒNG  —  /api/hang-phong
 * ════════════════════════════════════════════════════════════════════════════
 *
 * "Hạng phòng" = loại phòng trên catalog (Deluxe, Villa, Suite…), có giá,
 * sức chứa, ảnh. Khác với "Phòng" là phòng vật lý cụ thể (101, 205…).
 *
 * PHÂN QUYỀN 2 TẦNG cho controller này:
 *   Tầng 1 — SecurityConfig (BƯỚC 2, theo URL):
 *       GET /api/hang-phong/** → permitAll  (khách vãng lai xem catalog)
 *       các method khác        → authenticated
 *   Tầng 2 — @PreAuthorize (BƯỚC 4, theo VAI TRÒ), chạy sau khi đã xác thực:
 *       thao tác ghi yêu cầu MANAGER hoặc ADMIN.
 *
 * Cơ chế @PreAuthorize: bật nhờ @EnableMethodSecurity trong SecurityConfig.
 * Spring dựng một proxy AOP bao quanh controller; trước khi gọi thân hàm nó
 * đọc SecurityContextHolder (do JwtAuthenticationFilter nạp) và so với biểu thức.
 * Không khớp → ném AccessDeniedException → HTTP 403, thân hàm không chạy.
 * hasAnyRole('MANAGER','ADMIN') ngầm so với "ROLE_MANAGER"/"ROLE_ADMIN".
 *
 * @Tag / @Operation chỉ là mô tả cho Swagger UI (http://localhost:8080/swagger-ui.html),
 * không ảnh hưởng gì tới luồng xử lý.
 */
@RestController
@RequestMapping("/api/hang-phong")
@RequiredArgsConstructor
@Tag(name = "Hạng phòng", description = "Quản lý danh mục hạng phòng")
public class HangPhongController {

    private final HangPhongService hangPhongService;

    /**
     * TÌM KIẾM / LỌC / PHÂN TRANG  —  POST /api/hang-phong/filter
     *
     * Dùng POST thay vì GET vì điều kiện lọc là một object lồng nhau
     * (mảng filters + mảng sorts), nhét vào query string sẽ rất dài và khó đọc.
     *
     * Body ví dụ FE gửi lên (từ src/services/hangPhongService.ts):
     *   {
     *     "filters": [
     *        {"fieldName":"isActive","operation":"EQUALS","value":true,"logicType":"AND"},
     *        {"fieldName":"name","operation":"LIKE","value":"Deluxe","logicType":"AND"}
     *     ],
     *     "sorts":   [{"fieldName":"basePrice","direction":"ASC"}],
     *     "page": 0, "size": 9
     *   }
     *
     * Luồng: Controller → HangPhongServiceImpl.filterHangPhong()
     *        → BaseServiceImpl.filter() dựng Specification (WHERE động)
     *        → Hibernate sinh SQL: SELECT ... FROM hang_phong WHERE is_active = ?
     *          AND LOWER(name) LIKE ? ORDER BY base_price ASC LIMIT 9 OFFSET 0
     *        → mỗi bản ghi được buildResponse() bổ sung ảnh + số phòng
     *        → BaseResponsePaging{data, page, size, total}
     *
     * ⚠ KHÔNG có @PreAuthorize, nhưng vì là POST nên luật permitAll (chỉ cho GET)
     *   ở SecurityConfig không áp dụng → khách CHƯA đăng nhập gọi vào sẽ bị 401.
     *   Đây là lý do homepage hiện cảnh báo khi chưa đăng nhập.
     */
    @PostMapping("/filter")
    @Operation(summary = "Tìm kiếm, lọc, phân trang hạng phòng")
    public ResponseEntity<BaseResponse<BaseResponsePaging<HangPhongResponse>>> filter(
            @RequestBody BaseFilterRequest request) {
        return ResponseEntity.ok(hangPhongService.filterHangPhong(request));
    }

    /**
     * CHI TIẾT  —  GET /api/hang-phong/{id}
     * Là GET nên khách vãng lai xem được (khớp luật permitAll ở SecurityConfig).
     * FE dùng ở trang /rooms/:id và ở modal quản lý ảnh (để tải lại danh sách ảnh).
     */
    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(hangPhongService.getDetail(id));
    }

    /**
     * TẠO MỚI  —  POST /api/hang-phong
     * @Valid kiểm tra HangPhongRequest: code/name không rỗng, basePrice >= 0,
     * maxAdults 1–10… Sai thì trả 400 kèm tên trường lỗi, chưa chạm tới Service.
     * Service tự set isActive = true và mặc định maxAdults/maxChildren.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Tạo hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> create(@Valid @RequestBody HangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.createHangPhong(request));
    }

    /**
     * CẬP NHẬT  —  PUT /api/hang-phong/{id}
     * PUT = thay toàn bộ thông tin nghiệp vụ. Service dùng MapStruct
     * updateEntity(request, entity) để ghi đè lên entity đang có, nhờ đó
     * GIỮ NGUYÊN id, createdAt, isActive và danh sách ảnh.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Cập nhật hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> update(@PathVariable String id,
                                                                  @Valid @RequestBody HangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.updateHangPhong(id, request));
    }

    /**
     * BẬT / TẮT KINH DOANH  —  PATCH /api/hang-phong/{id}/active?active=true
     *
     * @RequestParam đọc tham số trên query string (?active=true), khác với
     * @PathVariable (đọc trong đường dẫn) và @RequestBody (đọc trong body).
     *
     * Dùng "tắt mềm" thay cho DELETE vì hạng phòng đã được các bảng khác
     * (phong, dat_phong, gia_phong_theo_ngay) tham chiếu — xoá cứng sẽ vỡ khoá ngoại
     * và mất lịch sử giá.
     */
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Bật / tắt hạng phòng (thay cho xóa)")
    public ResponseEntity<BaseResponse<HangPhongResponse>> setActive(@PathVariable String id,
                                                                     @RequestParam boolean active) {
        return ResponseEntity.ok(hangPhongService.setActive(id, active));
    }

    /**
     * THÊM ẢNH  —  POST /api/hang-phong/{id}/anh
     * Lưu URL ảnh (chuỗi) vào bảng anh_hang_phong, KHÔNG upload file nhị phân.
     * FE dán link ảnh vào modal "Ảnh" ở trang /admin/hang-phong.
     */
    @PostMapping("/{id}/anh")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Thêm ảnh cho hạng phòng")
    public ResponseEntity<BaseResponse<AnhHangPhongResponse>> addImage(@PathVariable String id,
                                                                       @Valid @RequestBody AnhHangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.addImage(id, request));
    }

    /**
     * XOÁ ẢNH  —  DELETE /api/hang-phong/{id}/anh/{anhId}
     * Hai @PathVariable. Service kiểm tra ảnh có đúng thuộc hạng phòng {id} không,
     * tránh việc đoán anhId để xoá ảnh của hạng phòng khác.
     */
    @DeleteMapping("/{id}/anh/{anhId}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Xóa ảnh của hạng phòng")
    public ResponseEntity<BaseResponse<Void>> removeImage(@PathVariable String id,
                                                          @PathVariable String anhId) {
        return ResponseEntity.ok(hangPhongService.removeImage(id, anhId));
    }
}
