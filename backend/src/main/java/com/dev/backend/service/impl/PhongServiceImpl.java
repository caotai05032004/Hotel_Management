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

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 5 — NGHIỆP VỤ PHÒNG VẬT LÝ
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mỗi bản ghi = một phòng có thật trong khách sạn (101, 205, V01…), thuộc về
 * đúng một hạng phòng và mang 3 trạng thái độc lập:
 *
 *   occupancyStatus     VACANT ⇄ OCCUPIED            ← chỉ đổi qua check-in/check-out
 *   housekeepingStatus  CLEAN / DIRTY / INSPECTED    ← buồng phòng cập nhật
 *   serviceStatus       IN_SERVICE / OUT_OF_ORDER / OUT_OF_SERVICE  ← kỹ thuật
 *
 * Các quy tắc nghiệp vụ được BẢO VỆ Ở TẦNG NÀY (frontend cũng chặn, nhưng
 * frontend có thể bị bỏ qua nên server vẫn phải kiểm tra lại):
 *   · Số phòng là duy nhất trong toàn khách sạn.
 *   · Không đổi hạng phòng khi phòng đang có khách.
 *   · Không đưa phòng ra khỏi hoạt động khi đang có khách.
 *   · Không xoá phòng đã từng có lịch sử lưu trú.
 */
@Service
public class PhongServiceImpl extends BaseServiceImpl<Phong, String> implements PhongService {

    private final PhongRepository phongRepository;
    private final HangPhongRepository hangPhongRepository;
    private final ChiTietDatPhongRepository chiTietDatPhongRepository;
    private final PhongMapper phongMapper;

    // Spring tiêm EntityManager của transaction hiện tại; BaseServiceImpl dùng để filter
    @PersistenceContext
    private EntityManager entityManager;

    // Phải viết constructor thủ công để gọi super(phongRepository)
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

    /**
     * TẠO PHÒNG — POST /api/phong  (MANAGER | ADMIN)
     *
     * Trình tự:
     *   1. Chuẩn hoá và kiểm tra trùng số phòng  → SELECT EXISTS(... WHERE room_number = ?)
     *   2. Kiểm tra hangPhongId có thật          → SELECT * FROM hang_phong WHERE id = ?
     *      (không có bước này thì Hibernate sẽ ném lỗi khoá ngoại khó hiểu lúc INSERT)
     *   3. Map DTO → Entity, gắn quan hệ hangPhong (chính là khoá ngoại hang_phong_id)
     *   4. Đặt 3 trạng thái mặc định cho phòng mới
     *   5. save() → INSERT INTO phong (...)
     */
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

    /**
     * SỬA PHÒNG — PUT /api/phong/{id}  (MANAGER | ADMIN)
     *
     * Bốn lớp kiểm tra trước khi ghi:
     *   1. Phòng có tồn tại không                         → 404
     *   2. Số phòng mới có đụng phòng khác không          → 400
     *      (existsByRoomNumberAndIdNot loại chính nó ra, nếu không thì giữ nguyên
     *       số phòng cũ cũng bị báo trùng)
     *   3. Đang có khách mà đòi đổi hạng phòng            → 400
     *   4. Hạng phòng mới có tồn tại không                → 404
     *
     * Gán từng trường thay vì dùng mapper để giữ nguyên 3 trạng thái hiện tại
     * của phòng (mapper toEntity() đã ignore các trạng thái này).
     */
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

    /** CHI TIẾT — GET /api/phong/{id}. Chỉ đọc nên dùng readOnly để khỏi dirty checking. */
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

    /**
     * LỌC + PHÂN TRANG — POST /api/phong/filter
     *
     *   filter(request) kế thừa từ BaseServiceImpl → Specification (WHERE động)
     *     + Pageable (ORDER BY, LIMIT/OFFSET) → 2 câu SQL: lấy dữ liệu + đếm tổng.
     *
     * Khác filterHangPhong ở chỗ KHÔNG bị N+1: PhongMapper lấy hangPhongCode/Name
     * bằng @Mapping(source = "hangPhong.code") ngay trong lúc map.
     * ⚠ Nhưng hangPhong là quan hệ LAZY, nên khi mapper chạm vào sẽ phát sinh
     *   một SELECT phụ cho mỗi phòng. Muốn tối ưu thì dùng @EntityGraph hoặc JOIN FETCH.
     *
     * Trang /admin/phong và Dashboard đều gọi endpoint này.
     */
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

    /**
     * ĐỔI TRẠNG THÁI — PATCH /api/phong/{id}/trang-thai  (lễ tân dùng hằng ngày)
     *
     * Ngữ nghĩa PATCH: trường nào gửi null thì GIỮ NGUYÊN giá trị cũ — thể hiện
     * bằng ba lệnh `if (request.getXxx() != null)` bên dưới.
     *
     * occupancyStatus cố tình KHÔNG có trong PhongTrangThaiRequest: trạng thái
     * có khách hay không phải do nghiệp vụ check-in/check-out quyết định,
     * không để nhân viên sửa tay.
     */
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

    /**
     * XOÁ PHÒNG — DELETE /api/phong/{id}  (MANAGER | ADMIN)
     *
     * Chỉ cho xoá CỨNG khi bảng chi_tiet_dat_phong chưa từng tham chiếu tới phòng
     * (existsByPhong_Id = false). Phòng đã có lịch sử lưu trú mà xoá thì hoá đơn
     * và báo cáo cũ sẽ mất dữ liệu tham chiếu → hướng dẫn chuyển OUT_OF_SERVICE.
     */
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
