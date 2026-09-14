package com.dev.backend.service.impl;

import com.dev.backend.constant.enums.HousekeepingStatus;
import com.dev.backend.constant.enums.OccupancyStatus;
import com.dev.backend.constant.enums.ServiceStatus;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.PhongRequest;
import com.dev.backend.dto.request.PhongTrangThaiRequest;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.BaseResponsePaging;
import com.dev.backend.dto.response.PhongResponse;
import com.dev.backend.entity.HangPhong;
import com.dev.backend.entity.Phong;
import com.dev.backend.mapper.PhongMapper;
import com.dev.backend.repository.ChiTietDatPhongRepository;
import com.dev.backend.repository.HangPhongRepository;
import com.dev.backend.repository.PhongRepository;
import com.dev.backend.service.PhongService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PhongServiceImpl extends BaseServiceImpl<Phong, String> implements PhongService {

    private final PhongRepository phongRepository;
    private final HangPhongRepository hangPhongRepository;
    private final ChiTietDatPhongRepository chiTietDatPhongRepository;
    private final PhongMapper phongMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public PhongServiceImpl(PhongRepository phongRepository,
                            HangPhongRepository hangPhongRepository,
                            ChiTietDatPhongRepository chiTietDatPhongRepository,
                            PhongMapper phongMapper) {
        super(phongRepository);
        this.phongRepository = phongRepository;
        this.hangPhongRepository = hangPhongRepository;
        this.chiTietDatPhongRepository = chiTietDatPhongRepository;
        this.phongMapper = phongMapper;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    @Override
    @Transactional
    public BaseResponse<PhongResponse> createPhong(PhongRequest request) {
        BaseResponse<PhongResponse> response = new BaseResponse<>();

        String roomNumber = request.getRoomNumber().trim();
        if (phongRepository.existsByRoomNumber(roomNumber)) {
            response.setCode(400);
            response.setMsg("Số phòng đã tồn tại");
            return response;
        }

        HangPhong hangPhong = hangPhongRepository.findById(request.getHangPhongId()).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        Phong phong = phongMapper.toEntity(request);
        phong.setRoomNumber(roomNumber);
        phong.setHangPhong(hangPhong);
        // Phòng mới: trống, sạch, đang hoạt động
        phong.setOccupancyStatus(OccupancyStatus.VACANT);
        phong.setHousekeepingStatus(HousekeepingStatus.CLEAN);
        phong.setServiceStatus(ServiceStatus.IN_SERVICE);

        phongRepository.save(phong);

        response.setCode(201);
        response.setMsg("Tạo phòng thành công");
        response.setData(phongMapper.toResponse(phong));
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<PhongResponse> updatePhong(String id, PhongRequest request) {
        BaseResponse<PhongResponse> response = new BaseResponse<>();

        Phong phong = getOne(id).orElse(null);
        if (phong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy phòng");
            return response;
        }

        String roomNumber = request.getRoomNumber().trim();
        if (phongRepository.existsByRoomNumberAndIdNot(roomNumber, id)) {
            response.setCode(400);
            response.setMsg("Số phòng đã được dùng cho phòng khác");
            return response;
        }

        // Không cho đổi hạng phòng khi đang có khách — sẽ làm sai giá / tồn kho
        if (!phong.getHangPhong().getId().equals(request.getHangPhongId())
                && phong.getOccupancyStatus() == OccupancyStatus.OCCUPIED) {
            response.setCode(400);
            response.setMsg("Không thể đổi hạng phòng khi phòng đang có khách");
            return response;
        }

        HangPhong hangPhong = hangPhongRepository.findById(request.getHangPhongId()).orElse(null);
        if (hangPhong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy hạng phòng");
            return response;
        }

        phong.setRoomNumber(roomNumber);
        phong.setFloorNo(request.getFloorNo());
        phong.setNote(request.getNote());
        phong.setHangPhong(hangPhong);
        phongRepository.save(phong);

        response.setCode(200);
        response.setMsg("Cập nhật phòng thành công");
        response.setData(phongMapper.toResponse(phong));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse<PhongResponse> getDetail(String id) {
        BaseResponse<PhongResponse> response = new BaseResponse<>();

        Phong phong = getOne(id).orElse(null);
        if (phong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy phòng");
            return response;
        }

        response.setCode(200);
        response.setMsg("Thành công");
        response.setData(phongMapper.toResponse(phong));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse<BaseResponsePaging<PhongResponse>> filterPhong(BaseFilterRequest request) {
        BaseResponse<BaseResponsePaging<PhongResponse>> response = new BaseResponse<>();

        Page<Phong> page = filter(request);
        List<PhongResponse> data = page.getContent().stream()
                .map(phongMapper::toResponse)
                .toList();

        BaseResponsePaging<PhongResponse> paging = BaseResponsePaging.<PhongResponse>builder()
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
    public BaseResponse<PhongResponse> updateTrangThai(String id, PhongTrangThaiRequest request) {
        BaseResponse<PhongResponse> response = new BaseResponse<>();

        Phong phong = getOne(id).orElse(null);
        if (phong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy phòng");
            return response;
        }

        // Không cho đưa phòng ra khỏi hoạt động khi đang có khách
        if (request.getServiceStatus() != null
                && request.getServiceStatus() != ServiceStatus.IN_SERVICE
                && phong.getOccupancyStatus() == OccupancyStatus.OCCUPIED) {
            response.setCode(400);
            response.setMsg("Phòng đang có khách, không thể chuyển sang " + request.getServiceStatus());
            return response;
        }

        if (request.getHousekeepingStatus() != null) phong.setHousekeepingStatus(request.getHousekeepingStatus());
        if (request.getServiceStatus() != null)      phong.setServiceStatus(request.getServiceStatus());
        if (request.getNote() != null)               phong.setNote(request.getNote());
        phongRepository.save(phong);

        response.setCode(200);
        response.setMsg("Cập nhật trạng thái phòng thành công");
        response.setData(phongMapper.toResponse(phong));
        return response;
    }

    @Override
    @Transactional
    public BaseResponse<Void> deletePhong(String id) {
        BaseResponse<Void> response = new BaseResponse<>();

        Phong phong = getOne(id).orElse(null);
        if (phong == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy phòng");
            return response;
        }

        if (chiTietDatPhongRepository.existsByPhong_Id(id)) {
            response.setCode(400);
            response.setMsg("Phòng đã có lịch sử lưu trú, không thể xóa. Hãy chuyển sang OUT_OF_SERVICE");
            return response;
        }

        phongRepository.delete(phong);

        response.setCode(200);
        response.setMsg("Xóa phòng thành công");
        return response;
    }
}
