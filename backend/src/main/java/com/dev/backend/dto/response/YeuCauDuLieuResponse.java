package com.dev.backend.dto.response;

import com.dev.backend.constant.enums.DataRequestStatus;
import com.dev.backend.constant.enums.DataRequestType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class YeuCauDuLieuResponse {
    private String id;
    private String nguoiDungId;
    private String nguoiDungEmail;
    private String nguoiDungHoTen;
    private DataRequestType requestType;
    private DataRequestStatus status;
    private String reason;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedByEmail;
}
