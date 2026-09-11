package com.dev.backend.dto.response;

import lombok.*;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class BaseResponsePaging<T> {
    private List<T> data;   // danh sách của trang hiện tại
    private int page;       // trang đang xem (bắt đầu từ 0)
    private int size;       // số phần tử mỗi trang
    private long total;     // tổng số bản ghi trong DB
}