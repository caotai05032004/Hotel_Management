package com.dev.backend.mapper;

import com.dev.backend.dto.request.PhongRequest;
import com.dev.backend.dto.response.PhongResponse;
import com.dev.backend.entity.Phong;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 7 — MAPSTRUCT: CẦU NỐI ENTITY ⇄ DTO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * MapStruct KHÔNG dùng reflection. Lúc biên dịch (mvn compile), annotation
 * processor sinh ra một class hiện thực ở target/generated-sources, ví dụ
 * PhongMapperImpl.java — bên trong chỉ là các lệnh get/set thuần Java nên rất nhanh
 * và mọi lỗi ánh xạ sai kiểu đều lộ ngay lúc build chứ không đợi tới runtime.
 *
 * componentModel = "spring"  → class sinh ra có @Component, Spring tiêm được.
 * disableBuilder = true      → dùng constructor + setter thay vì builder của Lombok
 *                              (tránh xung đột giữa hai bộ sinh code).
 *
 * Vì sao KHÔNG trả thẳng Entity về cho client?
 *   1. Entity chứa dữ liệu nhạy cảm (passwordHash, verificationToken).
 *   2. Entity có quan hệ LAZY — Jackson serialize ngoài transaction sẽ ném
 *      LazyInitializationException, hoặc vô tình kéo theo cả cây dữ liệu.
 *   3. Quan hệ hai chiều gây vòng lặp vô hạn khi serialize.
 *   4. Đổi cấu trúc bảng sẽ làm vỡ API của frontend.
 */
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface PhongMapper {

    // "hangPhong.code" -> lấy từ object con, giống @Mapping(source = "genre.name") của thầy
    @Mapping(source = "hangPhong.id",   target = "hangPhongId")
    @Mapping(source = "hangPhong.code", target = "hangPhongCode")
    @Mapping(source = "hangPhong.name", target = "hangPhongName")
    PhongResponse toResponse(Phong phong);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hangPhong", ignore = true)          // service set từ hangPhongId
    @Mapping(target = "occupancyStatus", ignore = true)
    @Mapping(target = "housekeepingStatus", ignore = true)
    @Mapping(target = "serviceStatus", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Phong toEntity(PhongRequest request);
}
