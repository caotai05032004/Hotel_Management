package com.dev.backend.dto.response;


import lombok.*;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  BƯỚC 8 — "PHONG BÌ" BỌC MỌI DỮ LIỆU TRẢ VỀ
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mọi endpoint trong dự án đều trả về ResponseEntity<BaseResponse<T>>, nên JSON
 * gửi xuống trình duyệt luôn có đúng 3 khoá:
 *
 *     { "code": 200, "msg": "Thành công", "data": { ... } }
 *
 * Vì sao cần lớp bọc này? Để frontend chỉ phải viết MỘT hàm xử lý chung
 * (unwrap() trong src/services/http.ts) thay vì mỗi API một kiểu.
 *
 * ⚠ ĐIỂM DỄ NHẦM NHẤT CỦA CẢ DỰ ÁN:
 *   `code` là MÃ NGHIỆP VỤ, KHÔNG phải HTTP status.
 *   Controller luôn gọi ResponseEntity.ok(...) → HTTP status luôn là 200,
 *   kể cả khi đăng nhập sai mật khẩu (lúc đó body có code = 400).
 *   → Frontend BẮT BUỘC kiểm tra body.code, nếu chỉ nhìn HTTP status thì
 *     mọi lỗi nghiệp vụ sẽ bị hiểu nhầm là thành công.
 *   (Ngoại lệ: CommonException đi qua GlobalExceptionHandler thì HTTP status
 *    và code khớp nhau.)
 *
 * Generic <T> cho phép data là bất cứ kiểu gì:
 *   BaseResponse<LoginResponse>, BaseResponse<HangPhongResponse>,
 *   BaseResponse<BaseResponsePaging<PhongResponse>>, BaseResponse<Void>…
 *
 * Jackson đọc các getter do Lombok @Data sinh ra để serialize thành JSON.
 * application.yml đặt default-property-inclusion: non_null nên trường null
 * (ví dụ data khi xoá thành công) sẽ bị lược khỏi JSON.
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data                      // = @Getter + @Setter + @ToString + @EqualsAndHashCode
public class BaseResponse<T> {

    /** Mã nghiệp vụ: 200/201 = thành công, 400/403/404/409/500 = lỗi. */
    private int code;

    /** Thông báo tiếng Việt, frontend hiển thị trực tiếp cho người dùng. */
    private String msg;

    /** Dữ liệu thật sự. null khi lỗi hoặc khi API không trả gì (BaseResponse<Void>). */
    private T data;

    /** Lối tắt cho trường hợp thành công đơn giản. */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(200, "Thành công", data);
    }

    /** Lối tắt cho trường hợp lỗi, data = null. */
    public static <T> BaseResponse<T> error(int code, String msg) {
        return new BaseResponse<>(code, msg, null);
    }
}
