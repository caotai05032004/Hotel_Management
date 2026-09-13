package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseFilterRequest {
    /*
     * ════════════════════════════════════════════════════════════════════════
     *  "NGÔN NGỮ TRUY VẤN" MÀ FRONTEND GỬI LÊN Ở MỌI ENDPOINT /filter
     * ════════════════════════════════════════════════════════════════════════
     *
     * Jackson đọc JSON body → dựng object này (BƯỚC 4), rồi
     * BaseServiceImpl.filter() dịch nó thành câu SQL thật (BƯỚC 6).
     *
     * Ví dụ trang /admin/phong gửi lên:
     *   {
     *     "filters": [
     *       {"fieldName":"roomNumber","operation":"LIKE","value":"10","logicType":"AND"},
     *       {"fieldName":"occupancyStatus","operation":"EQUALS","value":"VACANT","logicType":"AND"}
     *     ],
     *     "sorts": [{"fieldName":"floorNo","direction":"ASC"}],
     *     "page": 0, "size": 10
     *   }
     * → SELECT * FROM phong
     *    WHERE LOWER(room_number) LIKE '%10%' AND occupancy_status = 'VACANT'
     *    ORDER BY floor_no ASC LIMIT 10 OFFSET 0;
     *
     * @Builder.Default: bắt buộc khi dùng chung @Builder với giá trị khởi tạo,
     * nếu thiếu thì builder sẽ gán null thay vì giá trị mặc định bên dưới.
     */

    @Builder.Default
    List<FilterCriteria> filters = new ArrayList<>();   // các điều kiện WHERE

    @Builder.Default
    List<SortCriteria> sorts = new ArrayList<>();       // các cột ORDER BY

    @Builder.Default
    Integer page = 0;                                   // trang, đánh số từ 0

    @Builder.Default
    Integer size = 20;                                  // số bản ghi mỗi trang

}
