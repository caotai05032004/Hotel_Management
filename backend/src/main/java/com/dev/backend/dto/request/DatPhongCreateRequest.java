package com.dev.backend.dto.request;

import com.dev.backend.constant.enums.IdType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DatPhongCreateRequest {
    @NotBlank(message = "Hạng phòng không được để trống")
    private String hangPhongId;

    @NotBlank(message = "Tên người liên hệ không được để trống")
    @Size(max = 150)
    private String contactName;

    @Email(message = "Email không hợp lệ")
    private String contactEmail;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20)
    private String contactPhone;

    /**
     * CCCD / CMND / Hộ chiếu - Dữ liệu nhạy cảm theo Nghị định 356/2025.
     * KHÔNG bắt buộc khi đặt phòng online (lễ tân sẽ xác minh & bổ sung khi check-in đối chiếu giấy tờ thật).
     */
    @Size(max = 30)
    private String idNumber;

    private IdType idType = IdType.CCCD;

    @NotNull(message = "Ngày check-in không được để trống")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    private LocalDate checkOutDate;

    @Min(value = 1, message = "Số người lớn tối thiểu là 1")
    private Integer numAdults = 1;

    @Min(value = 0, message = "Số trẻ em không hợp lệ")
    private Integer numChildren = 0;

    @Size(max = 500)
    private String specialRequest;

    /** Checkbox đồng ý xử lý dữ liệu cá nhân theo Nghị định 356/2025/NĐ-CP */
    @NotNull(message = "Bạn cần đồng ý với Điều khoản bảo vệ dữ liệu cá nhân")
    private Boolean consentAccepted;
}
