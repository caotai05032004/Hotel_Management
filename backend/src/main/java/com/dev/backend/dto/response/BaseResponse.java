package com.dev.backend.dto.response;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class BaseResponse<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(200, "Thành công", data);
    }

    public static <T> BaseResponse<T> error(int code, String msg) {
        return new BaseResponse<>(code, msg, null);
    }
}