package com.dev.backend.controller;

import com.dev.backend.dto.request.CheckInRequest;
import com.dev.backend.dto.request.DatPhongCreateRequest;
import com.dev.backend.dto.response.DatPhongResponse;
import com.dev.backend.service.DatPhongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dat-phong")
@RequiredArgsConstructor
public class DatPhongController {

    private final DatPhongService datPhongService;

    @PostMapping
    public ResponseEntity<DatPhongResponse> taoDatPhong(
            @Valid @RequestBody DatPhongCreateRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(datPhongService.taoDatPhong(request, username));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DatPhongResponse>> layDanhSachCuaToi(Authentication authentication) {
        return ResponseEntity.ok(datPhongService.layDanhSachDatPhongCuaToi(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DatPhongResponse> layChiTiet(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.layChiTietDatPhong(id));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DatPhongResponse>> layTatCaDatPhongAdmin() {
        return ResponseEntity.ok(datPhongService.layTatCaDatPhongAdmin());
    }

    @PostMapping("/admin/{id}/check-in")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DatPhongResponse> checkIn(
            @PathVariable String id,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(datPhongService.checkInLuuTru(id, request));
    }

    @PostMapping("/admin/{id}/xac-nhan")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DatPhongResponse> xacNhanDatPhong(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.xacNhanDatPhong(id));
    }

    @PostMapping("/{id}/thanh-toan-coc")
    public ResponseEntity<DatPhongResponse> thanhToanCoc(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.thanhToanCoc(id));
    }

    @PostMapping("/admin/{id}/doi-phong")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DatPhongResponse> doiPhong(
            @PathVariable String id,
            @RequestParam String phongMoiId) {
        return ResponseEntity.ok(datPhongService.doiPhongLuuTru(id, phongMoiId));
    }

    @PostMapping("/admin/{id}/check-out")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DatPhongResponse> checkOutAdmin(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.checkOutLuuTru(id));
    }

    @PostMapping("/{id}/check-out-guest")
    public ResponseEntity<DatPhongResponse> checkOutGuest(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.checkOutLuuTru(id));
    }

    @PostMapping("/admin/{id}/no-show")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DatPhongResponse> danhDauNoShow(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.danhDauNoShow(id));
    }

    @PutMapping("/{id}/sua-pending")
    public ResponseEntity<DatPhongResponse> suaDatPhongPending(
            @PathVariable String id,
            @Valid @RequestBody DatPhongCreateRequest request) {
        return ResponseEntity.ok(datPhongService.suaDatPhongPending(id, request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<DatPhongResponse> huyDatPhong(@PathVariable String id) {
        return ResponseEntity.ok(datPhongService.huyDatPhongWithPolicy(id));
    }
}
