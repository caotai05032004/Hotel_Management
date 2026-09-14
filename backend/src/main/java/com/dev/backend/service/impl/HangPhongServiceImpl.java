package com.dev.backend.service.impl;

import com.dev.backend.dto.request.AnhHangPhongRequest;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.HangPhongRequest;
import com.dev.backend.dto.response.AnhHangPhongResponse;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.HangPhongResponse;
import com.dev.backend.entity.AnhHangPhong;
import com.dev.backend.entity.HangPhong;
import com.dev.backend.mapper.HangPhongMapper;
import com.dev.backend.repository.AnhHangPhongRepository;
import com.dev.backend.repository.HangPhongRepository;
import com.dev.backend.repository.PhongRepository;
import com.dev.backend.service.HangPhongService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HangPhongServiceImpl extends BaseServiceImpl<HangPhong, String>
        implements HangPhongService {

    private final HangPhongRepository hangPhongRepository;
    private final AnhHangPhongRepository anhHangPhongRepository;
    private final PhongRepository phongRepository;
    private final HangPhongMapper hangPhongMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public HangPhongServiceImpl(HangPhongRepository hangPhongRepository,
                                AnhHangPhongRepository anhHangPhongRepository,
                                PhongRepository phongRepository,
                                HangPhongMapper hangPhongMapper) {
        super(hangPhongRepository);
        this.hangPhongRepository = hangPhongRepository;
        this.anhHangPhongRepository = anhHangPhongRepository;
        this.phongRepository = phongRepository;
        this.hangPhongMapper = hangPhongMapper;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    // Hàm phụ: Entity -> Response, kèm danh sách ảnh và số phòng
    private HangPhongResponse buildResponse(HangPhong hangPhong) {
        HangPhongResponse res = hangPhongMapper.toResponse(hangPhong);
        res.setImages(hangPhongMapper.toAnhResponseList(
                anhHangPhongRepository.findByHangPhong_IdOrderBySortOrderAsc(hangPhong.getId())));
        res.setSoPhong(phongRepository.countByHangPhong_Id(hangPhong.getId()));
        return res;
    }

    @Override
    @Transactional
    public BaseResponse<HangPhongResponse> createHangPhong(HangPhongRequest request) {
        BaseResponse<HangPhongResponse> response = new BaseResponse<>();

        String code = request.getCode().trim().toUpperCase();
        if (hangPhongRepository.existsByCode(code)) {
            response.setCode(400);
            response.setMsg("Mã hạng phòng đã tồn tại");
            return response;
        }

        HangPhong hangPhong = hangPhongMapper.toEntity(request);
        hangPhong.setCode(code);
        hangPhong.setIsActive(true);
        if (hangPhong.getMaxAdults() == null) hangPhong.setMaxAdults(2);
        if (hangPhong.getMaxChildren() == null) hangPhong.setMaxChildren(1);

        hangPhongRepository.save(hangPhong);

        response.setCode(201);
        response.setMsg("Tạo hạng phòng thành công");
        response.setData(buildResponse(hangPhong));
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<HangPhongResponse> updateHangPhong(String id, HangPhongRequest request) {
        BaseResponse<HangPhongResponse> response = new BaseResponse<>();

        HangPhong hangPhong = getOne(id).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        String code = request.getCode().trim().toUpperCase();
        if (hangPhongRepository.existsByCodeAndIdNot(code, id)) {
            response.setCode(400);
            response.setMsg("Mã hạng phòng đã được dùng cho hạng khác");
            return response;
        }

        // Ghi đè các trường từ request lên entity đang có, giữ nguyên id / isActive / createdAt
        hangPhongMapper.updateEntity(request, hangPhong);
        hangPhong.setCode(code);
        hangPhongRepository.save(hangPhong);

        response.setCode(200);
        response.setMsg("Cập nhật hạng phòng thành công");
        response.setData(buildResponse(hangPhong));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse<HangPhongResponse> getDetail(String id) {
        BaseResponse<HangPhongResponse> response = new BaseResponse<>();

        HangPhong hangPhong = getOne(id).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        response.setCode(200);
        response.setMsg("Thành công");
        response.setData(buildResponse(hangPhong));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse<BaseResponsePaging<HangPhongResponse>> filterHangPhong(BaseFilterRequest request) {
        BaseResponse<BaseResponsePaging<HangPhongResponse>> response = new BaseResponse<>();

        Page<HangPhong> page = filter(request);            // hàm có sẵn của BaseServiceImpl
        List<HangPhongResponse> data = page.getContent().stream()
                .map(this::buildResponse)
                .toList();

        BaseResponsePaging<HangPhongResponse> paging = BaseResponsePaging.<HangPhongResponse>builder()
                .data(data)
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .build();

        response.setCode(200);
        response.setMsg("Thành công");
        response.setData(paging);
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<HangPhongResponse> setActive(String id, boolean active) {
        BaseResponse<HangPhongResponse> response = new BaseResponse<>();

        HangPhong hangPhong = getOne(id).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        hangPhong.setIsActive(active);
        hangPhongRepository.save(hangPhong);

        response.setCode(200);
        response.setMsg(active ? "Đã kích hoạt hạng phòng" : "Đã ngừng kinh doanh hạng phòng");
        response.setData(buildResponse(hangPhong));
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<AnhHangPhongResponse> addImage(String hangPhongId, AnhHangPhongRequest request) {
        BaseResponse<AnhHangPhongResponse> response = new BaseResponse<>();

        HangPhong hangPhong = getOne(hangPhongId).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        AnhHangPhong anh = hangPhongMapper.toAnhEntity(request);
        anh.setHangPhong(hangPhong);
        if (anh.getSortOrder() == null) anh.setSortOrder(0);
        anhHangPhongRepository.save(anh);

        response.setCode(201);
        response.setMsg("Thêm ảnh thành công");
        response.setData(hangPhongMapper.toAnhResponse(anh));
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<Void> removeImage(String hangPhongId, String anhId) {
        BaseResponse<Void> response = new BaseResponse<>();

        AnhHangPhong anh = anhHangPhongRepository.findById(anhId).orElse(null);
        // Ảnh phải tồn tại VÀ phải thuộc đúng hạng phòng trên URL
        if (anh == null || !anh.getHangPhong().getId().equals(hangPhongId)) {
            response.setCode(404);
            response.setMsg("Không tìm thấy ảnh");
            return response;
        }

        anhHangPhongRepository.delete(anh);

        response.setCode(200);
        response.setMsg("Xóa ảnh thành công");
        return response;
    }
}
