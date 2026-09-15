package com.dev.backend.service.impl;

import com.dev.backend.constant.enums.*;
import com.dev.backend.dto.request.CheckInRequest;
import com.dev.backend.dto.request.DatPhongCreateRequest;
import com.dev.backend.dto.request.GuestDeclarationDto;
import com.dev.backend.dto.response.DatPhongResponse;
import com.dev.backend.entity.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.*;
import com.dev.backend.security.CustomUserDetails;
import com.dev.backend.service.DatPhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DatPhongServiceImpl implements DatPhongService {

    private final DatPhongRepository datPhongRepository;
    private final HangPhongRepository hangPhongRepository;
    private final PhongRepository phongRepository;
    private final ChiTietDatPhongRepository chiTietDatPhongRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DongYDuLieuRepository dongYDuLieuRepository;
    private final KhaiBaoLuuTruRepository khaiBaoLuuTruRepository;

    @Override
    @Transactional
    public DatPhongResponse taoDatPhong(DatPhongCreateRequest request, String username) {
        // Backend Validation
        LocalDate today = LocalDate.now();
        if (request.getCheckInDate() == null || request.getCheckInDate().isBefore(today)) {
            throw new CommonException("Ngày nhận phòng không được trước ngày hôm nay (" + today + ")");
        }
        if (request.getCheckOutDate() == null || !request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new CommonException("Ngày trả phòng (Check-out) phải sau ngày nhận phòng (Check-in)");
        }
        if (request.getNumAdults() == null || request.getNumAdults() < 1) {
            throw new CommonException("Số lượng người lớn phải lớn hơn hoặc bằng 1");
        }
        if (request.getNumChildren() == null || request.getNumChildren() < 0) {
            throw new CommonException("Số lượng trẻ em không được là số âm");
        }
        if (request.getContactPhone() == null || !request.getContactPhone().matches("^0[0-9]{9,10}$")) {
            throw new CommonException(
                    "Số điện thoại liên hệ phải là số điện thoại Việt Nam hợp lệ (10 - 11 chữ số, bắt đầu bằng số 0)");
        }
        // CCCD/Hộ chiếu KHÔNG bắt buộc khi đặt online - lễ tân sẽ xác minh & bổ sung khi check-in.
        // Nếu khách đã điền thì vẫn kiểm tra đúng định dạng.
        String idNumber = request.getIdNumber() != null && !request.getIdNumber().isBlank()
                ? request.getIdNumber().trim()
                : null;
        if (idNumber != null && !idNumber.matches("^[0-9A-Za-z]{8,20}$")) {
            throw new CommonException("Số CCCD/CMND/Hộ chiếu phải từ 8 đến 20 ký tự số/chữ");
        }

        HangPhong hangPhong = hangPhongRepository.findById(request.getHangPhongId())
                .orElseThrow(() -> new CommonException("Hạng phòng không tồn tại: " + request.getHangPhongId()));

        NguoiDung nguoiDung = null;
        if (username != null && !username.isBlank()) {
            nguoiDung = nguoiDungRepository.findByEmail(username).orElse(null);
        }

        // Tính số đêm lưu trú
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights <= 0) {
            nights = 1;
        }

        BigDecimal giaDem = hangPhong.getBasePrice() != null ? hangPhong.getBasePrice() : BigDecimal.ZERO;
        BigDecimal estimatedTotal = giaDem.multiply(BigDecimal.valueOf(nights));

        // Sinh mã booking ngẫu nhiên độc nhất BK + timestamp
        String bookingCode = "BK" + (System.currentTimeMillis() % 100000000L);

        DatPhong datPhong = DatPhong.builder()
                .bookingCode(bookingCode)
                .nguoiDung(nguoiDung)
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .idNumberRaw(idNumber)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numAdults(request.getNumAdults())
                .numChildren(request.getNumChildren())
                .status(BookingStatus.PENDING)
                .depositAmount(estimatedTotal.multiply(BigDecimal.valueOf(0.3))) // Cọc 30%
                .estimatedTotal(estimatedTotal)
                .specialRequest(request.getSpecialRequest())
                .build();

        DatPhong savedDatPhong = datPhongRepository.save(datPhong);

        // Tạo chi tiết đặt phòng
        ChiTietDatPhong chiTiet = ChiTietDatPhong.builder()
                .datPhong(savedDatPhong)
                .hangPhong(hangPhong)
                .ratePerNight(giaDem)
                .build();

        chiTietDatPhongRepository.save(chiTiet);

        // Lưu vết Consent đồng ý dữ liệu cá nhân theo Nghị định 356/2025/NĐ-CP
        if (nguoiDung != null && Boolean.TRUE.equals(request.getConsentAccepted())) {
            DongYDuLieu dongY = DongYDuLieu.builder()
                    .nguoiDung(nguoiDung)
                    .consentType(ConsentType.IDENTITY_DOCUMENT)
                    .policyVersion("ND356/2025")
                    .granted(true)
                    .ipAddress("127.0.0.1")
                    .build();
            dongYDuLieuRepository.save(dongY);
        }

        return toDatPhongResponse(savedDatPhong, chiTiet, idNumber);
    }

    @Override
    @Transactional
    public DatPhongResponse xacNhanDatPhong(String datPhongId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));
        datPhong.setStatus(BookingStatus.CONFIRMED);
        DatPhong updated = datPhongRepository.save(datPhong);
        ChiTietDatPhong ct = updated.getDetails().isEmpty() ? null : updated.getDetails().get(0);
        return toDatPhongResponse(updated, ct, null);
    }

    @Override
    @Transactional
    public DatPhongResponse thanhToanCoc(String datPhongId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));
        datPhong.setStatus(BookingStatus.CONFIRMED);
        DatPhong updated = datPhongRepository.save(datPhong);
        ChiTietDatPhong ct = updated.getDetails().isEmpty() ? null : updated.getDetails().get(0);
        return toDatPhongResponse(updated, ct, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatPhongResponse> layDanhSachDatPhongCuaToi(String username) {
        NguoiDung user = nguoiDungRepository.findByEmail(username)
                .orElseThrow(() -> new CommonException("Người dùng không tồn tại"));

        List<DatPhong> list = datPhongRepository.findByNguoiDung_IdOrderByCreatedAtDesc(user.getId());
        return list.stream().map(dp -> {
            ChiTietDatPhong ct = dp.getDetails().isEmpty() ? null : dp.getDetails().get(0);
            return toDatPhongResponse(dp, ct, null);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatPhongResponse> layTatCaDatPhongAdmin() {
        List<DatPhong> list = datPhongRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(dp -> {
            ChiTietDatPhong ct = dp.getDetails().isEmpty() ? null : dp.getDetails().get(0);
            return toDatPhongResponse(dp, ct, null);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DatPhongResponse layChiTietDatPhong(String id) {
        DatPhong datPhong = datPhongRepository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + id));

        ChiTietDatPhong ct = datPhong.getDetails().isEmpty() ? null : datPhong.getDetails().get(0);
        return toDatPhongResponse(datPhong, ct, null);
    }

    @Override
    @Transactional
    public DatPhongResponse checkInLuuTru(String datPhongId, CheckInRequest request) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        Phong phong = phongRepository.findById(request.getPhongId())
                .orElseThrow(() -> new CommonException("Không tìm thấy phòng: " + request.getPhongId()));

        ChiTietDatPhong chiTiet = chiTietDatPhongRepository.findById(request.getChiTietDatPhongId())
                .orElseThrow(() -> new CommonException("Không tìm thấy chi tiết đặt phòng"));

        // Validate phòng phải thuộc đúng hạng phòng của đơn đặt
        if (!phong.getHangPhong().getId().equals(chiTiet.getHangPhong().getId())) {
            throw new CommonException("Phòng được chọn (" + phong.getRoomNumber() + ") không thuộc Hạng phòng đã đặt ("
                    + chiTiet.getHangPhong().getName() + ")");
        }

        // CCCD người đặt phòng bắt buộc phải có trước khi check-in: nếu đơn online chưa có,
        // lễ tân phải xác minh giấy tờ thật và bổ sung qua contactIdNumber ở đây.
        if (datPhong.getIdNumberRaw() == null || datPhong.getIdNumberRaw().isBlank()) {
            String contactIdNumber = request.getContactIdNumber() != null ? request.getContactIdNumber().trim() : null;
            if (contactIdNumber == null || contactIdNumber.isBlank()) {
                throw new CommonException("Đơn đặt phòng chưa có số CCCD/Hộ chiếu của người đặt, vui lòng nhập trước khi check-in");
            }
            if (!contactIdNumber.matches("^[0-9A-Za-z]{8,20}$")) {
                throw new CommonException("Số CCCD/CMND/Hộ chiếu phải từ 8 đến 20 ký tự số/chữ");
            }
            datPhong.setIdNumberRaw(contactIdNumber);
        }

        // Gán phòng thực tế và cập nhật trạng thái phòng sang OCCUPIED
        chiTiet.setPhong(phong);
        chiTietDatPhongRepository.save(chiTiet);

        phong.setOccupancyStatus(OccupancyStatus.OCCUPIED);
        phongRepository.save(phong);

        // Lưu khai báo lưu trú theo Luật Cư trú
        if (request.getDanhSachKhach() != null) {
            for (GuestDeclarationDto g : request.getDanhSachKhach()) {
                byte[] idEncrypted = g.getIdNumber() != null ? g.getIdNumber().getBytes(StandardCharsets.UTF_8)
                        : new byte[0];
                KhaiBaoLuuTru kb = KhaiBaoLuuTru.builder()
                        .chiTietDatPhong(chiTiet)
                        .fullName(g.getFullName())
                        .dateOfBirth(g.getDateOfBirth())
                        .gender(g.getGender() != null ? g.getGender() : Gender.OTHER)
                        .idType(g.getIdType() != null ? g.getIdType() : IdType.CCCD)
                        .idNumberEncrypted(idEncrypted)
                        .nationality(g.getNationality() != null ? g.getNationality() : "Việt Nam")
                        .permanentAddress(g.getPermanentAddress())
                        .isPrimaryGuest(Boolean.TRUE.equals(g.getIsPrimaryGuest()))
                        .build();
                khaiBaoLuuTruRepository.save(kb);
            }
        }

        // Đổi trạng thái đơn sang CHECKED_IN
        datPhong.setStatus(BookingStatus.CHECKED_IN);
        DatPhong updated = datPhongRepository.save(datPhong);

        return toDatPhongResponse(updated, chiTiet, null);
    }

    @Override
    @Transactional
    public DatPhongResponse doiPhongLuuTru(String datPhongId, String phongMoiId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        if (datPhong.getStatus() != BookingStatus.CHECKED_IN) {
            throw new CommonException("Chỉ có thể đổi phòng khi đơn đang ở trạng thái CHECKED_IN");
        }

        ChiTietDatPhong chiTiet = datPhong.getDetails().isEmpty() ? null : datPhong.getDetails().get(0);
        if (chiTiet == null) {
            throw new CommonException("Đơn đặt phòng chưa có chi tiết");
        }

        Phong phongMoi = phongRepository.findById(phongMoiId)
                .orElseThrow(() -> new CommonException("Không tìm thấy phòng mới: " + phongMoiId));

        if (!phongMoi.getHangPhong().getId().equals(chiTiet.getHangPhong().getId())) {
            throw new CommonException("Phòng mới phải cùng Hạng phòng với hạng phòng khách đã đặt");
        }

        // Trả phòng cũ về VACANT
        Phong phongCu = chiTiet.getPhong();
        if (phongCu != null) {
            phongCu.setOccupancyStatus(OccupancyStatus.VACANT);
            phongRepository.save(phongCu);
        }

        // Gán phòng mới & chuyển OCCUPIED
        phongMoi.setOccupancyStatus(OccupancyStatus.OCCUPIED);
        phongRepository.save(phongMoi);

        chiTiet.setPhong(phongMoi);
        chiTietDatPhongRepository.save(chiTiet);

        return toDatPhongResponse(datPhong, chiTiet, null);
    }

    @Override
    @Transactional
    public DatPhongResponse checkOutLuuTru(String datPhongId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        if (datPhong.getStatus() != BookingStatus.CHECKED_IN) {
            throw new CommonException("Chỉ có thể Check-out khi khách đang ở trạng thái CHECKED_IN");
        }

        ChiTietDatPhong chiTiet = datPhong.getDetails().isEmpty() ? null : datPhong.getDetails().get(0);
        if (chiTiet != null && chiTiet.getPhong() != null) {
            Phong phong = chiTiet.getPhong();
            phong.setOccupancyStatus(OccupancyStatus.VACANT);
            phongRepository.save(phong);
        }

        datPhong.setStatus(BookingStatus.CHECKED_OUT);
        DatPhong updated = datPhongRepository.save(datPhong);

        return toDatPhongResponse(updated, chiTiet, null);
    }

    @Override
    @Transactional
    public DatPhongResponse danhDauNoShow(String datPhongId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        if (datPhong.getStatus() != BookingStatus.CONFIRMED && datPhong.getStatus() != BookingStatus.PENDING) {
            throw new CommonException("Chỉ có thể đánh dấu NO_SHOW cho đơn đang ở trạng thái PENDING hoặc CONFIRMED");
        }

        datPhong.setStatus(BookingStatus.NO_SHOW);
        DatPhong updated = datPhongRepository.save(datPhong);

        ChiTietDatPhong ct = updated.getDetails().isEmpty() ? null : updated.getDetails().get(0);
        return toDatPhongResponse(updated, ct, null);
    }

    @Override
    @Transactional
    public DatPhongResponse suaDatPhongPending(String datPhongId, DatPhongCreateRequest request) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        if (datPhong.getStatus() != BookingStatus.PENDING) {
            throw new CommonException("Chỉ được chỉnh sửa đơn khi đang ở trạng thái PENDING");
        }

        datPhong.setContactName(request.getContactName());
        datPhong.setContactEmail(request.getContactEmail());
        datPhong.setContactPhone(request.getContactPhone());
        datPhong.setCheckInDate(request.getCheckInDate());
        datPhong.setCheckOutDate(request.getCheckOutDate());
        datPhong.setNumAdults(request.getNumAdults());
        datPhong.setNumChildren(request.getNumChildren());
        datPhong.setSpecialRequest(request.getSpecialRequest());

        DatPhong updated = datPhongRepository.save(datPhong);
        ChiTietDatPhong ct = updated.getDetails().isEmpty() ? null : updated.getDetails().get(0);
        return toDatPhongResponse(updated, ct, null);
    }

    @Override
    @Transactional
    public DatPhongResponse huyDatPhongWithPolicy(String datPhongId) {
        return huyDatPhong(datPhongId);
    }

    @Override
    @Transactional
    public DatPhongResponse huyDatPhong(String datPhongId) {
        DatPhong datPhong = datPhongRepository.findById(datPhongId)
                .orElseThrow(() -> new CommonException("Không tìm thấy đơn đặt phòng: " + datPhongId));

        datPhong.setStatus(BookingStatus.CANCELLED);
        datPhong.setCancelledAt(LocalDateTime.now());
        DatPhong updated = datPhongRepository.save(datPhong);

        ChiTietDatPhong ct = datPhong.getDetails().isEmpty() ? null : datPhong.getDetails().get(0);
        if (ct != null && ct.getPhong() != null) {
            Phong phong = ct.getPhong();
            phong.setOccupancyStatus(OccupancyStatus.VACANT);
            phongRepository.save(phong);
        }

        return toDatPhongResponse(updated, ct, null);
    }

    private DatPhongResponse toDatPhongResponse(DatPhong dp, ChiTietDatPhong ct, String rawIdNumber) {
        String hangPhongId = ct != null && ct.getHangPhong() != null ? ct.getHangPhong().getId() : null;
        String hangPhongName = ct != null && ct.getHangPhong() != null ? ct.getHangPhong().getName() : null;
        String phongId = ct != null && ct.getPhong() != null ? ct.getPhong().getId() : null;
        String roomNumber = ct != null && ct.getPhong() != null ? ct.getPhong().getRoomNumber() : null;
        String chiTietId = ct != null ? ct.getId() : null;

        String realId = dp.getIdNumberRaw() != null ? dp.getIdNumberRaw() : rawIdNumber;
        boolean canViewFull = canViewFullIdNumber(dp);
        String displayId = realId == null ? null : (canViewFull ? realId : maskIdNumber(realId));

        return DatPhongResponse.builder()
                .id(dp.getId())
                .bookingCode(dp.getBookingCode())
                .contactName(dp.getContactName())
                .contactEmail(dp.getContactEmail())
                .contactPhone(dp.getContactPhone())
                .idNumberMasked(displayId)
                .checkInDate(dp.getCheckInDate())
                .checkOutDate(dp.getCheckOutDate())
                .numAdults(dp.getNumAdults())
                .numChildren(dp.getNumChildren())
                .status(dp.getStatus())
                .depositAmount(dp.getDepositAmount())
                .estimatedTotal(dp.getEstimatedTotal())
                .specialRequest(dp.getSpecialRequest())
                .createdAt(dp.getCreatedAt())
                .hangPhongId(hangPhongId)
                .hangPhongName(hangPhongName)
                .chiTietDatPhongId(chiTietId)
                .phongId(phongId)
                .roomNumber(roomNumber)
                .build();
    }

    /**
     * CCCD chỉ hiển thị đầy đủ (không che) cho ADMIN/MANAGER hoặc chính khách hàng sở hữu đơn (đã đăng nhập).
     * Lễ tân (RECEPTIONIST) và mọi trường hợp khác chỉ thấy bản che 4 số cuối.
     */
    private boolean canViewFullIdNumber(DatPhong dp) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            return false;
        }
        boolean isAdminOrManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if (isAdminOrManager) {
            return true;
        }
        return dp.getNguoiDung() != null && dp.getNguoiDung().getId().equals(principal.getId());
    }

    private String maskIdNumber(String idNumber) {
        if (idNumber == null || idNumber.isBlank()) {
            return null;
        }
        int len = idNumber.length();
        if (len <= 4) {
            return "****";
        }
        return "*".repeat(len - 4) + idNumber.substring(len - 4);
    }
}
