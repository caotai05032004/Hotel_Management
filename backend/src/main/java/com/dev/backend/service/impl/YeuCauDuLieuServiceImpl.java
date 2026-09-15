package com.dev.backend.service.impl;

import com.dev.backend.constant.enums.DataRequestStatus;
import com.dev.backend.constant.enums.DataRequestType;
import com.dev.backend.dto.response.YeuCauDuLieuResponse;
import com.dev.backend.entity.DatPhong;
import com.dev.backend.entity.NguoiDung;
import com.dev.backend.entity.YeuCauDuLieu;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.DatPhongRepository;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.repository.YeuCauDuLieuRepository;
import com.dev.backend.service.YeuCauDuLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class YeuCauDuLieuServiceImpl implements YeuCauDuLieuService {

    private final YeuCauDuLieuRepository yeuCauDuLieuRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DatPhongRepository datPhongRepository;

    @Override
    @Transactional
    public YeuCauDuLieuResponse guiYeuCauXoa(String username, String reason) {
        NguoiDung user = nguoiDungRepository.findByEmail(username)
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng: " + username));

        YeuCauDuLieu yc = YeuCauDuLieu.builder()
                .nguoiDung(user)
                .requestType(DataRequestType.ERASURE)
                .status(DataRequestStatus.RECEIVED)
                .reason(reason != null && !reason.isBlank() ? reason : "Khách hàng yêu cầu xóa dữ liệu cá nhân theo ND356/2025")
                .requestedAt(LocalDateTime.now())
                .build();

        YeuCauDuLieu saved = yeuCauDuLieuRepository.save(yc);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<YeuCauDuLieuResponse> layTatCaYeuCauAdmin() {
        return yeuCauDuLieuRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public YeuCauDuLieuResponse duyetYeuCau(String id, String adminUsername) {
        YeuCauDuLieu yc = yeuCauDuLieuRepository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy yêu cầu xóa dữ liệu: " + id));

        NguoiDung admin = nguoiDungRepository.findByEmail(adminUsername).orElse(null);

        yc.setStatus(DataRequestStatus.COMPLETED);
        yc.setProcessedAt(LocalDateTime.now());
        yc.setProcessedBy(admin);

        // Tiến hành Ẩn danh (Anonymize) thông tin nhạy cảm của người dùng trong các đơn đặt phòng đã CHECKED_OUT
        List<DatPhong> userBookings = datPhongRepository.findByNguoiDung_IdOrderByCreatedAtDesc(yc.getNguoiDung().getId());
        for (DatPhong dp : userBookings) {
            dp.setContactPhone("0000000000");
            dp.setContactEmail("anonymized_" + dp.getId().substring(0, 6) + "@deleted.local");
            datPhongRepository.save(dp);
        }

        YeuCauDuLieu updated = yeuCauDuLieuRepository.save(yc);
        return toResponse(updated);
    }

    private YeuCauDuLieuResponse toResponse(YeuCauDuLieu yc) {
        return YeuCauDuLieuResponse.builder()
                .id(yc.getId())
                .nguoiDungId(yc.getNguoiDung().getId())
                .nguoiDungEmail(yc.getNguoiDung().getEmail())
                .nguoiDungHoTen(yc.getNguoiDung().getFullName())
                .requestType(yc.getRequestType())
                .status(yc.getStatus())
                .reason(yc.getReason())
                .requestedAt(yc.getRequestedAt())
                .processedAt(yc.getProcessedAt())
                .processedByEmail(yc.getProcessedBy() != null ? yc.getProcessedBy().getEmail() : null)
                .build();
    }
}
