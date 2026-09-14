package com.dev.backend.dto.response;

import com.dev.backend.constant.enums.HousekeepingStatus;
import com.dev.backend.constant.enums.OccupancyStatus;
import com.dev.backend.constant.enums.ServiceStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhongResponse {
    String id;
    String roomNumber;
    Integer floorNo;
    OccupancyStatus occupancyStatus;
    HousekeepingStatus housekeepingStatus;
    ServiceStatus serviceStatus;
    String note;
    LocalDateTime updatedAt;
    // Thông tin hạng phòng — phẳng hóa, không trả cả entity HangPhong
    String hangPhongId;
    String hangPhongCode;
    String hangPhongName;
}
