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

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 5 — NGHIỆP VỤ HẠNG PHÒNG (danh mục loại phòng)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vị trí trong luồng:
 *   HangPhongController  →  [class này]  →  Repository  →  Hibernate  →  MySQL
 *                                        ←  Entity      ←
 *        MapStruct Mapper: Entity → HangPhongResponse  →  BaseResponse  →  JSON
 *
 * Quy ước chung của các service trong dự án:
 *   - Không ném exception cho lỗi nghiệp vụ thường gặp (không tìm thấy, trùng mã…)
 *     mà set code 400/404 vào BaseResponse, HTTP status vẫn 200.
 *     → Frontend phải đọc body.code (hàm unwrap() trong src/services/http.ts).
 *   - Chỉ ném exception cho lỗi thật sự bất thường → GlobalExceptionHandler xử lý.
 *
 * Kế thừa BaseServiceImpl để dùng lại getOne(), filter() (bộ lọc động dùng chung).
 */
@Service
public class HangPhongServiceImpl extends BaseServiceImpl<HangPhong, String>
        implements HangPhongService {

    private final HangPhongRepository hangPhongRepository;
    private final AnhHangPhongRepository anhHangPhongRepository;
    private final PhongRepository phongRepository;
    private final HangPhongMapper hangPhongMapper;

    /**
     * @PersistenceContext tiêm EntityManager do Spring quản lý (theo transaction hiện tại).
     * BaseServiceImpl cần nó để dựng CriteriaQuery khi filter.
     */
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Không dùng được @RequiredArgsConstructor vì phải gọi super(hangPhongRepository)
     * để lớp cha biết thao tác trên repository nào.
     */
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

    /**
     * ĐIỂM CHUYỂN ĐỔI Entity → DTO (BƯỚC 7 của luồng).
     *
     * Vì sao phải có hàm riêng thay vì chỉ gọi mapper?
     *   HangPhongMapper.toResponse() cố tình @Mapping(ignore) hai trường
     *   `images` và `soPhong` — chúng không lấy được trực tiếp từ entity:
     *     - images  : quan hệ LAZY, truy cập ngoài transaction sẽ ném
     *                 LazyInitializationException → phải query riêng, có ORDER BY sortOrder.
     *     - soPhong : là kết quả COUNT ở bảng khác (phong), không phải cột của hang_phong.
     *
     * ⚠ Hiệu năng: gọi hàm này trong vòng lặp của filterHangPhong() gây N+1 query
     *   (mỗi hạng phòng thêm 2 câu SELECT). Với danh mục vài chục bản ghi thì chấp nhận được;
     *   nếu dữ liệu lớn nên gom bằng một câu JOIN + GROUP BY.
     *
     * Hàm phụ: Entity -> Response, kèm danh sách ảnh và số phòng
     */
    private HangPhongResponse buildResponse(HangPhong hangPhong) {
        HangPhongResponse res = hangPhongMapper.toResponse(hangPhong);
        res.setImages(hangPhongMapper.toAnhResponseList(
                anhHangPhongRepository.findByHangPhong_IdOrderBySortOrderAsc(hangPhong.getId())));
        res.setSoPhong(phongRepository.countByHangPhong_Id(hangPhong.getId()));
        return res;
    }

    /**
     * TẠO HẠNG PHÒNG — POST /api/hang-phong  (MANAGER | ADMIN)
     *
     * Tới được đây nghĩa là request đã vượt qua:
     *   [2] JWT hợp lệ  →  [4] @PreAuthorize cho phép  →  @Valid không phát hiện lỗi.
     *
     * Bên trong:
     *   1. Chuẩn hoá mã về CHỮ HOA (DLX, STE…) cho đồng nhất
     *   2. Kiểm tra trùng mã       → SELECT EXISTS(... WHERE code = ?)
     *   3. Map DTO → Entity, gán mặc định isActive/maxAdults/maxChildren
     *   4. save()                  → INSERT INTO hang_phong (...)
     *   5. buildResponse()         → gắn thêm ảnh + số phòng rồi trả về
     */
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

        // MapStruct bỏ qua id/isActive/createdAt/images/rooms (xem @Mapping(ignore) trong mapper)
        HangPhong hangPhong = hangPhongMapper.toEntity(request);
        hangPhong.setCode(code);
        hangPhong.setIsActive(true);          // hạng phòng mới mặc định đang kinh doanh
        if (hangPhong.getMaxAdults() == null) hangPhong.setMaxAdults(2);
        if (hangPhong.getMaxChildren() == null) hangPhong.setMaxChildren(1);

        hangPhongRepository.save(hangPhong);

        response.setCode(201);
        response.setMsg("Tạo hạng phòng thành công");
        response.setData(buildResponse(hangPhong));
        return response;
    }

    /**
     * CẬP NHẬT — PUT /api/hang-phong/{id}  (MANAGER | ADMIN)
     *
     * Điểm cần chú ý: dùng mapper.updateEntity(request, entityCũ) chứ KHÔNG
     * tạo entity mới từ request rồi save đè. Nếu tạo mới thì id/createdAt/isActive
     * và danh sách ảnh sẽ bị ghi đè thành null.
     *
     * Kiểm tra trùng mã dùng existsByCodeAndIdNot(code, id) — loại chính nó ra,
     * nếu không thì sửa mà giữ nguyên mã cũ cũng bị báo "mã đã tồn tại".
     */
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

    /**
     * CHI TIẾT — GET /api/hang-phong/{id}  (công khai, khách vãng lai xem được)
     *
     * readOnly = true: Hibernate bỏ qua dirty checking và flush → nhanh hơn,
     * đồng thời báo cho driver JDBC biết đây là transaction chỉ đọc.
     */
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

    /**
     * LỌC + PHÂN TRANG — POST /api/hang-phong/filter
     *
     * Đây là API frontend dùng nhiều nhất (homepage, /rooms, /admin/hang-phong).
     *
     * Chuỗi xử lý:
     *   1. filter(request)  — hàm kế thừa từ BaseServiceImpl:
     *        · createSpecification(filters) → dựng mệnh đề WHERE động bằng Criteria API
     *        · createPageable(sorts,page,size) → ORDER BY + LIMIT/OFFSET
     *        · specificationExecutor.findAll(spec, pageable)
     *          → Hibernate sinh 2 câu: SELECT dữ liệu trang hiện tại + SELECT COUNT(*)
     *   2. Duyệt từng entity, buildResponse() để gắn ảnh và số phòng
     *   3. Đóng gói vào BaseResponsePaging{data, page, size, total}
     *      → FE dùng `total` để vẽ component Pagination.
     */
    @Override
    @Transactional(readOnly = true)
    public BaseResponse<BaseResponsePaging<HangPhongResponse>> filterHangPhong(BaseFilterRequest request) {
        BaseResponse<BaseResponsePaging<HangPhongResponse>> response = new BaseResponse<>();

        // Page<T> của Spring Data đã chứa sẵn: nội dung trang, số trang, cỡ trang, tổng bản ghi
        Page<HangPhong> page = filter(request);            // hàm có sẵn của BaseServiceImpl

        // Entity → DTO cho từng phần tử (đây là chỗ phát sinh N+1 query đã nói ở buildResponse)
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

    /**
     * BẬT / TẮT KINH DOANH — PATCH /api/hang-phong/{id}/active?active=true|false
     *
     * "Xoá mềm": không DELETE khỏi DB vì hạng phòng đã được phong, dat_phong,
     * gia_phong_theo_ngay tham chiếu. Tắt rồi thì khách không thấy trên catalog
     * (FE lọc isActive = true) nhưng dữ liệu lịch sử vẫn nguyên vẹn.
     */
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

    /**
     * THÊM ẢNH — POST /api/hang-phong/{id}/anh
     *
     * Lưu URL ảnh dạng chuỗi vào bảng anh_hang_phong, KHÔNG upload file nhị phân
     * (muốn upload thật thì cần thêm @RequestPart MultipartFile + nơi lưu trữ).
     * anh.setHangPhong(hangPhong) chính là thao tác gán khoá ngoại hang_phong_id.
     */
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

    /**
     * XOÁ ẢNH — DELETE /api/hang-phong/{id}/anh/{anhId}
     *
     * Kiểm tra ảnh có thuộc đúng hạng phòng trên URL không — nếu bỏ bước này,
     * người dùng có thể đoán anhId để xoá ảnh của hạng phòng khác
     * (lỗi bảo mật IDOR — Insecure Direct Object Reference).
     */
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
