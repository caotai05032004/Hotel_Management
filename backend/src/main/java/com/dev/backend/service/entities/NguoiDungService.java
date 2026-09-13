package com.dev.backend.service.entities;


import com.dev.backend.dto.request.UpdateNguoiDungRequest;
import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.entity.NguoiDung;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.service.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 5 — NGHIỆP VỤ NGƯỜI DÙNG
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kế thừa BaseServiceImpl<NguoiDung, String> để dùng lại CRUD + filter dùng chung
 * (getOne, create, update, filter…). Tham số generic thứ hai là String vì khoá
 * chính trong DB là CHAR(36) UUID.
 */
@Service
public class NguoiDungService extends BaseServiceImpl<NguoiDung, String> {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungMapper nguoiDungMapper;
    private final PasswordEncoder passwordEncoder;

    // EntityManager do Spring tiêm, BaseServiceImpl cần để dựng CriteriaQuery khi filter
    @PersistenceContext
    private EntityManager entityManager;

    // Phải tự viết constructor để gọi super(repository) — Lombok không làm được
    public NguoiDungService(NguoiDungRepository nguoiDungRepository,
                            NguoiDungMapper nguoiDungMapper, PasswordEncoder passwordEncoder) {
        super(nguoiDungRepository);          // BaseServiceImpl lấy repo này để làm CRUD + filter
        this.nguoiDungRepository = nguoiDungRepository;
        this.nguoiDungMapper = nguoiDungMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    /**
     * XEM HỒ SƠ — phục vụ GET /api/user/user/{id}
     *
     * Luồng: Controller → hàm này → getOne(id) (BaseServiceImpl → repository.findById)
     *        → SELECT * FROM nguoi_dung WHERE id = ?
     *        → mapper.toResponse() bỏ passwordHash/verificationToken,
     *          đổi Set<VaiTro> → List<String>
     *        → BaseResponse{code, msg, data} → Jackson → JSON → FE render.
     */
    public BaseResponse<NguoiDungResponse> userDetail(String id) {
        BaseResponse<NguoiDungResponse> response = new BaseResponse<>();

        // getOne(id) là hàm có sẵn của BaseServiceImpl (= repository.findById)
        NguoiDung nguoiDung = getOne(id).orElse(null);
        if (nguoiDung == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy người dùng");
            return response;
        }

        response.setCode(200);
        response.setMsg("Thành công");
        // KHÔNG trả thẳng entity: entity chứa passwordHash và quan hệ LAZY,
        // Jackson sẽ vừa lộ dữ liệu nhạy cảm vừa ném LazyInitializationException.
        response.setData(nguoiDungMapper.toResponse(nguoiDung));
        return response;
    }

    /**
     * CẬP NHẬT HỒ SƠ — phục vụ POST /api/user/update
     *
     * Định danh người cần sửa bằng EMAIL (không phải id), nên email là trường khoá
     * và không thể tự đổi qua endpoint này.
     *
     * ⚠ HAI ĐIỂM CẦN LƯU Ý (đã ghi trong frontend/README-FE.md):
     *
     *  (1) KHÔNG có repository.save(nguoiDung) và method này KHÔNG có @Transactional
     *      riêng. Nó chỉ dựa vào @Transactional khai báo ở cấp class của
     *      BaseServiceImpl cha để Hibernate dirty-checking tự sinh UPDATE.
     *      Đây là hành vi ngầm, dễ vỡ khi refactor → nên thêm tường minh:
     *          @Transactional
     *          ...
     *          nguoiDungRepository.save(nguoiDung);
     *
     *  (2) Mật khẩu LUÔN bị encode lại. Nếu client gửi password rỗng thì mật khẩu
     *      của người dùng sẽ trở thành chuỗi rỗng đã băm → không đăng nhập được nữa.
     *      Nên bọc trong điều kiện:
     *          if (StringUtils.isNotBlank(request.getPassword())) { ... }
     *      Hiện frontend đang bắt buộc nhập mật khẩu mới để né lỗi này.
     */
    public BaseResponse<NguoiDungResponse> update(UpdateNguoiDungRequest request) {
        BaseResponse<NguoiDungResponse> response = new BaseResponse<>();

        // Tra cứu theo email  →  SELECT * FROM nguoi_dung WHERE email = ?
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail()).orElse(null);

        if (nguoiDung == null) {
            response.setCode(404);
            response.setMsg("Không tìm thấy người dùng");
            return response;
        }

        // Gán giá trị mới lên entity đang được Hibernate quản lý
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setFullName(request.getFullName());
        nguoiDung.setPhone(request.getPhone());
        nguoiDung.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        response.setCode(200);
        response.setMsg("Cập nhập người dùng thành công");
        response.setData(nguoiDungMapper.toResponse(nguoiDung));
        return response;
    }
}
