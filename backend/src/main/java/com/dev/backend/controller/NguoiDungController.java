package com.dev.backend.controller;

import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.service.entities.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping("/user/{id}")
    public ResponseEntity<BaseResponse<NguoiDungResponse>> userDetail(@PathVariable String id) {
        return ResponseEntity.ok(nguoiDungService.userDetail(id));
    }
}
