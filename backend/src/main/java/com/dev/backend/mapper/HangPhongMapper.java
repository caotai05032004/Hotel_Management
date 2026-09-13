package com.dev.backend.mapper;

import com.dev.backend.dto.request.AnhHangPhongRequest;
import com.dev.backend.dto.request.HangPhongRequest;
import com.dev.backend.dto.response.AnhHangPhongResponse;
import com.dev.backend.dto.response.HangPhongResponse;
import com.dev.backend.entity.AnhHangPhong;
import com.dev.backend.entity.HangPhong;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 7 — MAPSTRUCT: CẦU NỐI ENTITY ⇄ DTO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * MapStruct KHÔNG dùng reflection. Lúc biên dịch (mvn compile), annotation
 * processor sinh ra một class hiện thực ở target/generated-sources, ví dụ
 * HangPhongMapperImpl.java — bên trong chỉ là các lệnh get/set thuần Java nên rất nhanh
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
public interface HangPhongMapper {

    // ----- Entity -> Response -----
    @Mapping(target = "images", ignore = true)   // service tự gán (query riêng)
    @Mapping(target = "soPhong", ignore = true)
    HangPhongResponse toResponse(HangPhong hangPhong);

    AnhHangPhongResponse toAnhResponse(AnhHangPhong anh);

    List<AnhHangPhongResponse> toAnhResponseList(List<AnhHangPhong> list);

    // ----- Request -> Entity -----
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rooms", ignore = true)
    HangPhong toEntity(HangPhongRequest request);

    /**
     * Cập nhật entity đang có bằng dữ liệu request (không tạo entity mới) —
     * nhờ đó giữ nguyên id, createdAt, isActive, quan hệ.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rooms", ignore = true)
    void updateEntity(HangPhongRequest request, @MappingTarget HangPhong hangPhong);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hangPhong", ignore = true)
    AnhHangPhong toAnhEntity(AnhHangPhongRequest request);
}
