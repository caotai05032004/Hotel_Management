package com.dev.backend.service.entities;


import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.dto.response.NguoiDungResponse;
import com.dev.backend.entity.NguoiDung;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.service.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

@Service
public class NguoiDungService extends BaseServiceImpl<NguoiDung, String> {

    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungMapper nguoiDungMapper;

    @PersistenceContext
    private EntityManager entityManager;

    // Phải tự viết constructor để gọi super(repository) — Lombok không làm được
    public NguoiDungService(NguoiDungRepository nguoiDungRepository,
                            NguoiDungMapper nguoiDungMapper) {
        super(nguoiDungRepository);          // BaseServiceImpl lấy repo này để làm CRUD + filter
        this.nguoiDungRepository = nguoiDungRepository;
        this.nguoiDungMapper = nguoiDungMapper;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

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
        response.setData(nguoiDungMapper.toResponse(nguoiDung));
        return response;
    }
}