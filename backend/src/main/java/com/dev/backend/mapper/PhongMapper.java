package com.dev.backend.mapper;

import com.dev.backend.dto.request.PhongRequest;
import com.dev.backend.dto.response.PhongResponse;
import com.dev.backend.entity.Phong;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
