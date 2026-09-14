package com.dev.backend.dto.request;

import com.dev.backend.constant.enums.HousekeepingStatus;
import com.dev.backend.constant.enums.ServiceStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Đổi trạng thái vệ sinh / kỹ thuật của phòng. Trường nào null thì giữ nguyên.
 * occupancyStatus KHÔNG cho đổi ở đây — nó chỉ đổi qua check-in / check-out.
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhongTrangThaiRequest {
    HousekeepingStatus housekeepingStatus;   // CLEAN, DIRTY, INSPECTED
    ServiceStatus serviceStatus;             // IN_SERVICE, OUT_OF_ORDER, OUT_OF_SERVICE
    String note;
}
