package com.dev.backend.service;

import com.dev.backend.dto.request.AnhHangPhongRequest;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.HangPhongRequest;
import com.dev.backend.dto.response.AnhHangPhongResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.HangPhongResponse;
import com.dev.backend.entity.HangPhong;

public interface HangPhongService extends BaseService<HangPhong, String> {

    BaseResponse<HangPhongResponse> createHangPhong(HangPhongRequest request);

    BaseResponse<HangPhongResponse> updateHangPhong(String id, HangPhongRequest request);

    BaseResponse<HangPhongResponse> getDetail(String id);

    BaseResponse<BaseResponsePaging<HangPhongResponse>> filterHangPhong(BaseFilterRequest request);

    /** Bật / tắt hạng phòng (thay cho xóa cứng vì đã có đặt phòng tham chiếu). */
    BaseResponse<HangPhongResponse> setActive(String id, boolean active);

    BaseResponse<AnhHangPhongResponse> addImage(String hangPhongId, AnhHangPhongRequest request);

    BaseResponse<Void> removeImage(String hangPhongId, String anhId);
}
