package com.dev.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CheckInRequest {
    @NotBlank(message = "ID chi tiết đặt phòng không được để trống")
    private String chiTietDatPhongId;

    @NotBlank(message = "Số phòng được gán không được để trống")
    private String phongId;

    /**
     * CCCD/Hộ chiếu của người đặt phòng (dat_phong.id_number_raw), chỉ cần gửi khi đơn
     * đặt online chưa có sẵn số này - lễ tân xác minh giấy tờ thật rồi nhập bổ sung tại đây.
     */
    private String contactIdNumber;

    private List<GuestDeclarationDto> danhSachKhach = new ArrayList<>();
}
