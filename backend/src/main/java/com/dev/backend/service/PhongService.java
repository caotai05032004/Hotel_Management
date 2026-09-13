package com.dev.backend.service;

import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.PhongRequest;
import com.dev.backend.dto.request.PhongTrangThaiRequest;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.PhongResponse;
import com.dev.backend.entity.Phong;

public interface PhongService extends BaseService<Phong, String> {

    BaseResponse<PhongResponse> createPhong(PhongRequest request);

    BaseResponse<PhongResponse> updatePhong(String id, PhongRequest request);

    BaseResponse<PhongResponse> getDetail(String id);

    BaseResponse<BaseResponsePaging<PhongResponse>> filterPhong(BaseFilterRequest request);

    /** Lễ tân / buồng phòng đổi trạng thái vệ sinh, kỹ thuật. */
    BaseResponse<PhongResponse> updateTrangThai(String id, PhongTrangThaiRequest request);

    /** Chỉ xóa được khi phòng chưa từng có khách ở. */
    BaseResponse<Void> deletePhong(String id);
}
