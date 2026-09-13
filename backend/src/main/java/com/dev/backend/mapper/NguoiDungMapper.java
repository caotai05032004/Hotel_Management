package com.dev.backend.mapper;

import com.dev.backend.dto.request.RegisterRequest;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.entity.NguoiDung;
import com.dev.backend.entity.VaiTro;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 7 — MAPSTRUCT: CẦU NỐI ENTITY ⇄ DTO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * MapStruct KHÔNG dùng reflection. Lúc biên dịch (mvn compile), annotation
 * processor sinh ra một class hiện thực ở target/generated-sources, ví dụ
 * NguoiDungMapperImpl.java — bên trong chỉ là các lệnh get/set thuần Java nên rất nhanh
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
public interface NguoiDungMapper {

    // Entity -> Response. roles là Set<VaiTro> nhưng response cần List<String>
    // nên MapStruct sẽ tự gọi hàm rolesToCodes() bên dưới
    @Mapping(source = "roles", target = "roles")
    NguoiDungResponse toResponse(NguoiDung nguoiDung);

    // Request -> Entity. Các trường không có trong request hoặc phải tự set
    // trong service (password, status, roles) thì ignore
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "hoSoKhach", ignore = true)
    @Mapping(target = "emailVerifiedAt", ignore = true)
    @Mapping(target = "verificationToken", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "anonymizedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    NguoiDung toEntity(RegisterRequest request);

    // Hàm phụ: MapStruct tự dùng khi cần đổi Set<VaiTro> -> List<String>
    default List<String> rolesToCodes(Set<VaiTro> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(VaiTro::getCode).toList();
    }
}