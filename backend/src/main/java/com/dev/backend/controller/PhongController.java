package com.dev.backend.controller;

import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.PhongRequest;
import com.dev.backend.dto.request.PhongTrangThaiRequest;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.PhongResponse;
import com.dev.backend.service.PhongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONTROLLER PHÒNG VẬT LÝ  —  /api/phong
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Phòng vật lý là dữ liệu nội bộ -> mọi API đều cần đăng nhập nhân viên.
 * Không có endpoint nào permitAll, và MỌI method đều có @PreAuthorize.
 *
 * Bảng phân quyền (khớp với RequireAuth ở frontend):
 *   ┌────────────────────────────┬──────────────────────────────────┐
 *   │ Thao tác                   │ Vai trò được phép                │
 *   ├────────────────────────────┼──────────────────────────────────┤
 *   │ Xem danh sách / chi tiết   │ RECEPTIONIST, MANAGER, ADMIN     │
 *   │ Đổi trạng thái vệ sinh     │ RECEPTIONIST, MANAGER, ADMIN     │
 *   │ Tạo / sửa / xoá            │ MANAGER, ADMIN                   │
 *   └────────────────────────────┴──────────────────────────────────┘
 * Lễ tân được đổi trạng thái vì đó là việc hằng ngày, nhưng không được
 * thêm/xoá phòng vì đó là thay đổi cấu trúc khách sạn.
 *
 * Mỗi phòng có 3 trạng thái độc lập:
 *   occupancyStatus    VACANT / OCCUPIED              ← chỉ đổi qua check-in/check-out
 *   housekeepingStatus CLEAN / DIRTY / INSPECTED      ← buồng phòng cập nhật
 *   serviceStatus      IN_SERVICE / OUT_OF_ORDER / OUT_OF_SERVICE ← kỹ thuật
 */
@RestController
@RequestMapping("/api/phong")
@RequiredArgsConstructor
@Tag(name = "Phòng", description = "Quản lý phòng vật lý")
public class PhongController {

    private final PhongService phongService;

    /**
     * DANH SÁCH  —  POST /api/phong/filter
     *
     * FE trang /admin/phong gửi tối đa 5 điều kiện cùng lúc:
     *   roomNumber LIKE, hangPhong EQUALS <id>, occupancyStatus / housekeepingStatus /
     *   serviceStatus EQUALS <enum>  + sắp xếp theo floorNo, roomNumber.
     *
     * Lưu ý fieldName "hangPhong" (không phải "hangPhongId") vì Specification
     * làm việc trên TÊN FIELD CỦA ENTITY Phong, mà entity khai báo
     * `private HangPhong hangPhong;` — Hibernate tự so sánh với khoá ngoại hang_phong_id.
     *
     * Dashboard (/admin) cũng gọi endpoint này với size lớn để đếm
     * số phòng trống / chưa dọn / hỏng hóc, vì backend chưa có API thống kê riêng.
     */
    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Tìm kiếm, lọc, phân trang phòng")
    public ResponseEntity<BaseResponse<BaseResponsePaging<PhongResponse>>> filter(
            @RequestBody BaseFilterRequest request) {
        return ResponseEntity.ok(phongService.filterPhong(request));
    }

    /** CHI TIẾT — GET /api/phong/{id}. PhongResponse đã "phẳng hoá" thông tin hạng phòng. */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Chi tiết phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(phongService.getDetail(id));
    }

    /**
     * TẠO PHÒNG  —  POST /api/phong
     * Service kiểm tra: số phòng chưa tồn tại + hangPhongId có thật,
     * rồi đặt mặc định VACANT / CLEAN / IN_SERVICE cho phòng mới.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Tạo phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> create(@Valid @RequestBody PhongRequest request) {
        return ResponseEntity.ok(phongService.createPhong(request));
    }

    /**
     * SỬA PHÒNG  —  PUT /api/phong/{id}
     * Service chặn việc đổi hạng phòng khi phòng đang có khách (OCCUPIED),
     * vì sẽ làm sai giá và sai tồn kho của lượt lưu trú đang diễn ra.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Cập nhật phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> update(@PathVariable String id,
                                                              @Valid @RequestBody PhongRequest request) {
        return ResponseEntity.ok(phongService.updatePhong(id, request));
    }

    /**
     * ĐỔI TRẠNG THÁI  —  PATCH /api/phong/{id}/trang-thai
     *
     * PATCH = cập nhật MỘT PHẦN: trường nào gửi null thì giữ nguyên giá trị cũ
     * (xem điều kiện `if (request.getXxx() != null)` trong PhongServiceImpl).
     * Không có @Valid vì mọi trường đều tuỳ chọn.
     *
     * Đây là API lễ tân dùng nhiều nhất: đánh dấu phòng đã dọn, báo hỏng thiết bị.
     */
    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Đổi trạng thái vệ sinh / kỹ thuật của phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> updateTrangThai(@PathVariable String id,
                                                                       @RequestBody PhongTrangThaiRequest request) {
        return ResponseEntity.ok(phongService.updateTrangThai(id, request));
    }

    /**
     * XOÁ PHÒNG  —  DELETE /api/phong/{id}
     * Service chỉ cho xoá khi chi_tiet_dat_phong chưa từng tham chiếu tới phòng này.
     * Phòng đã có lịch sử lưu trú thì phải chuyển sang OUT_OF_SERVICE thay vì xoá,
     * để giữ nguyên dữ liệu hoá đơn và báo cáo cũ.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Xóa phòng (chỉ khi chưa có lịch sử lưu trú)")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable String id) {
        return ResponseEntity.ok(phongService.deletePhong(id));
    }
}
