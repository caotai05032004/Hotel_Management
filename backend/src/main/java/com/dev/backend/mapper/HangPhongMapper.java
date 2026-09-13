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
