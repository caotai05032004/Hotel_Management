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

@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Loi validation tu @Valid: tra ve map ten truong -> thong bao. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(body(400, "Dữ liệu không hợp lệ", errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(body(400, ex.getMessage(), null));
    }

    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<Map<String, Object>> handleAuth(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(body(401, ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body(500, ex.getMessage(), null));
    }

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

    /** Lỗi không lường trước -> 500, không lộ stack trace cho client. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Object>> handleOther(Exception ex) {
        BaseResponse<Object> body = BaseResponse.builder()
                .code(500)
                .msg("Lỗi hệ thống: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
