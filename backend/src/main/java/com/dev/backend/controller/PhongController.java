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

/** Phòng vật lý là dữ liệu nội bộ -> mọi API đều cần đăng nhập nhân viên. */
@RestController
@RequestMapping("/api/phong")
@RequiredArgsConstructor
@Tag(name = "Phòng", description = "Quản lý phòng vật lý")
public class PhongController {

    private final PhongService phongService;

    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Tìm kiếm, lọc, phân trang phòng")
    public ResponseEntity<BaseResponse<BaseResponsePaging<PhongResponse>>> filter(
            @RequestBody BaseFilterRequest request) {
        return ResponseEntity.ok(phongService.filterPhong(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Chi tiết phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(phongService.getDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Tạo phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> create(@Valid @RequestBody PhongRequest request) {
        return ResponseEntity.ok(phongService.createPhong(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Cập nhật phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> update(@PathVariable String id,
                                                              @Valid @RequestBody PhongRequest request) {
        return ResponseEntity.ok(phongService.updatePhong(id, request));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','MANAGER','ADMIN')")
    @Operation(summary = "Đổi trạng thái vệ sinh / kỹ thuật của phòng")
    public ResponseEntity<BaseResponse<PhongResponse>> updateTrangThai(@PathVariable String id,
                                                                       @RequestBody PhongTrangThaiRequest request) {
        return ResponseEntity.ok(phongService.updateTrangThai(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Xóa phòng (chỉ khi chưa có lịch sử lưu trú)")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable String id) {
        return ResponseEntity.ok(phongService.deletePhong(id));
    }
}
