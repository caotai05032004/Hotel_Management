package com.dev.backend.exception;

import com.dev.backend.dto.response.BaseResponse;
import com.dev.backend.exception.customize.CommonException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  "LƯỚI AN TOÀN" — BẮT MỌI EXCEPTION THOÁT RA KHỎI CONTROLLER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody → Spring đăng ký class
 * này cho TẤT CẢ controller. Khi thân hàm controller (hoặc service nó gọi) ném ra
 * exception, Spring dò trong class này xem có @ExceptionHandler nào khớp KIỂU
 * exception đó không; khớp thì gọi hàm đó và dùng kết quả làm response.
 *
 * Vị trí trong luồng: nhánh RẼ của BƯỚC 4–7. Thay vì đi tiếp tới Jackson với
 * dữ liệu thành công, request rẽ sang đây rồi mới serialize thành JSON lỗi.
 *
 *      Controller/Service ném exception
 *            ↓
 *      GlobalExceptionHandler chọn handler khớp kiểu
 *            ↓
 *      Trả ResponseEntity<Map> hoặc ResponseEntity<BaseResponse>
 *            ↓
 *      Jackson → JSON  →  axios phía FE thấy HTTP 4xx/5xx → vào nhánh catch
 *            ↓
 *      toApiError() trong src/services/http.ts đọc "message"/"msg" và "errors"
 *
 * ⚠ Hai kiểu body KHÁC NHAU đang cùng tồn tại (FE đã xử lý cả hai):
 *     · handleValidation / handleIllegalArgument / handleAuth / handleIllegalState
 *       → {timestamp, status, message, errors}
 *     · handleCommon / handleOther
 *       → BaseResponse {code, msg, data}
 *   Thống nhất về một kiểu sẽ sạch hơn cho cả hai phía.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * LỖI VALIDATION — xảy ra ở BƯỚC 4, TRƯỚC khi vào thân hàm controller.
     *
     * Khi @Valid phát hiện DTO vi phạm @NotBlank / @Email / @Size / @Pattern,
     * Spring ném MethodArgumentNotValidException. Hàm này gom TẤT CẢ lỗi thành
     * map "tên trường → thông báo" nên frontend tô đỏ được đúng ô nhập:
     *
     *   { "timestamp": "...", "status": 400, "message": "Dữ liệu không hợp lệ",
     *     "errors": { "email": "Email không đúng định dạng",
     *                 "password": "Mật khẩu phải từ 6 đến 64 ký tự" } }
     *
     * FE: getFieldErrors(err) đọc đúng object "errors" này và gọi setErrors(...).
     *
     * Loi validation tu @Valid: tra ve map ten truong -> thong bao.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(body(400, "Dữ liệu không hợp lệ", errors));
    }

    /** Tham số sai logic (ví dụ BaseServiceImpl ném khi operation không hỗ trợ) → 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(body(400, ex.getMessage(), null));
    }

    /**
     * Lỗi xác thực của Spring Security → 401.
     * Chỉ kích hoạt nếu dùng authenticationManager.authenticate(); luồng login
     * hiện tại tự so mật khẩu nên không đi qua đây.
     */
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<Map<String, Object>> handleAuth(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(body(401, ex.getMessage(), null));
    }

    /** Sai trạng thái hệ thống (reflection thất bại, thiếu cấu hình…) → 500. */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body(500, ex.getMessage(), null));
    }

    /** Hàm dựng body chung. LinkedHashMap để giữ đúng thứ tự khoá khi in ra JSON. */
    private Map<String, Object> body(int status, String message, Object details) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("timestamp", LocalDateTime.now().toString());
        map.put("status", status);
        map.put("message", message);
        if (details != null) {
            map.put("errors", details);
        }
        return map;
    }

    /**
     * EXCEPTION NGHIỆP VỤ TỰ ĐỊNH NGHĨA — cách "chuẩn" để service báo lỗi.
     * CommonException mang sẵn HttpStatus nên trả đúng mã HTTP thật
     * (ví dụ AuthServiceImpl.register ném 409 khi email đã tồn tại).
     */
    @ExceptionHandler(CommonException.class)
    public ResponseEntity<BaseResponse<Object>> handleCommon(CommonException ex) {
        HttpStatus status = ex.getHttpStatus() != null ? ex.getHttpStatus() : HttpStatus.BAD_REQUEST;
        BaseResponse<Object> body = BaseResponse.builder()
                .code(status.value())
                .msg(ex.getMessage())
                .data(ex.getData())
                .build();
        return ResponseEntity.status(status).body(body);
    }

    /**
     * CHỐT CHẶN CUỐI CÙNG — mọi exception chưa được xử lý ở trên đều rơi vào đây.
     * Lỗi không lường trước -> 500, không lộ stack trace cho client.
     *
     * ⚠ Vẫn ghép ex.getMessage() vào msg nên có thể lộ thông tin nội bộ
     *   (tên bảng, tên cột trong lỗi SQL). Môi trường production nên trả câu
     *   chung chung và log stack trace lại phía server.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Object>> handleOther(Exception ex) {
        BaseResponse<Object> body = BaseResponse.builder()
                .code(500)
                .msg("Lỗi hệ thống: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
