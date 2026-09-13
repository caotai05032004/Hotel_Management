package com.dev.backend.dto.response;

import lombok.*;
import java.util.List;

/**
 * Kết quả PHÂN TRANG, luôn nằm bên trong BaseResponse.data của các endpoint /filter.
 *
 * JSON frontend nhận được:
 *   { "code":200, "msg":"Thành công",
 *     "data": { "data":[...9 hạng phòng...], "page":0, "size":9, "total":23 } }
 *
 * Đây là bản rút gọn của Page<T> (Spring Data) — Page<T> có tới ~15 trường
 * (pageable, sort, first, last, numberOfElements…) khiến JSON rất nặng và
 * cấu trúc hay đổi giữa các phiên bản Spring. Chỉ giữ 4 trường mà FE thật sự cần.
 *
 * `total` là thứ component Pagination ở frontend dùng để tính số trang:
 *     totalPages = ceil(total / size)
 */
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
