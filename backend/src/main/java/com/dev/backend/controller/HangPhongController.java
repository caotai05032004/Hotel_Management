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
 * GET  /api/hang-phong/** đã permitAll trong SecurityConfig (khách xem catalog).
 * Các thao tác ghi yêu cầu MANAGER hoặc ADMIN.
 */
@RestController
@RequestMapping("/api/hang-phong")
@RequiredArgsConstructor
@Tag(name = "Hạng phòng", description = "Quản lý danh mục hạng phòng")
public class HangPhongController {

    private final HangPhongService hangPhongService;

    @PostMapping("/filter")
    @Operation(summary = "Tìm kiếm, lọc, phân trang hạng phòng")
    public ResponseEntity<BaseResponse<BaseResponsePaging<HangPhongResponse>>> filter(
            @RequestBody BaseFilterRequest request) {
        return ResponseEntity.ok(hangPhongService.filterHangPhong(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(hangPhongService.getDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Tạo hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> create(@Valid @RequestBody HangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.createHangPhong(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Cập nhật hạng phòng")
    public ResponseEntity<BaseResponse<HangPhongResponse>> update(@PathVariable String id,
                                                                  @Valid @RequestBody HangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.updateHangPhong(id, request));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Bật / tắt hạng phòng (thay cho xóa)")
    public ResponseEntity<BaseResponse<HangPhongResponse>> setActive(@PathVariable String id,
                                                                     @RequestParam boolean active) {
        return ResponseEntity.ok(hangPhongService.setActive(id, active));
    }

    @PostMapping("/{id}/anh")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Thêm ảnh cho hạng phòng")
    public ResponseEntity<BaseResponse<AnhHangPhongResponse>> addImage(@PathVariable String id,
                                                                       @Valid @RequestBody AnhHangPhongRequest request) {
        return ResponseEntity.ok(hangPhongService.addImage(id, request));
    }

    @DeleteMapping("/{id}/anh/{anhId}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @Operation(summary = "Xóa ảnh của hạng phòng")
    public ResponseEntity<BaseResponse<Void>> removeImage(@PathVariable String id,
                                                          @PathVariable String anhId) {
        return ResponseEntity.ok(hangPhongService.removeImage(id, anhId));
    }
}
