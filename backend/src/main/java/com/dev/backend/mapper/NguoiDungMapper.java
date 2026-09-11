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