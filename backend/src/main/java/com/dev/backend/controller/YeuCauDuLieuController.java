package com.dev.backend.controller;

import com.dev.backend.dto.response.YeuCauDuLieuResponse;
import com.dev.backend.service.YeuCauDuLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/yeu-cau-du-lieu")
@RequiredArgsConstructor
public class YeuCauDuLieuController {

    private final YeuCauDuLieuService yeuCauDuLieuService;

    @PostMapping("/gui-yeu-cau-xoa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<YeuCauDuLieuResponse> guiYeuCauXoa(
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(yeuCauDuLieuService.guiYeuCauXoa(authentication.getName(), reason));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<YeuCauDuLieuResponse>> layTatCaYeuCauAdmin() {
        return ResponseEntity.ok(yeuCauDuLieuService.layTatCaYeuCauAdmin());
    }

    @PostMapping("/admin/{id}/duyet")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<YeuCauDuLieuResponse> duyetYeuCau(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(yeuCauDuLieuService.duyetYeuCau(id, authentication.getName()));
    }
}
