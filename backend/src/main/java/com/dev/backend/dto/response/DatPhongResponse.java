package com.dev.backend.dto.response;

import com.dev.backend.constant.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DatPhongResponse {
    private String id;
    private String bookingCode;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    
    /** CCCD được Masking riêng tư theo Nghị định 356/2025 (Ví dụ: ********5678) */
    private String idNumberMasked;
    
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numAdults;
    private Integer numChildren;
    private BookingStatus status;
    private BigDecimal depositAmount;
    private BigDecimal estimatedTotal;
    private String specialRequest;
    private LocalDateTime createdAt;

    // Chi tiết hạng phòng & phòng được gán
    private String hangPhongId;
    private String hangPhongName;
    private String chiTietDatPhongId;
    private String phongId;
    private String roomNumber;
}
