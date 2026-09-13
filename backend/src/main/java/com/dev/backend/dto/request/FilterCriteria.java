package com.dev.backend.dto.request;

import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.FilterOperation;
import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FilterCriteria {
    /**
     * Một điều kiện lọc = một mệnh đề trong WHERE.
     *
     * fieldName : TÊN FIELD TRONG ENTITY (camelCase), không phải tên cột DB.
     *             Hỗ trợ field lồng nhau: "hangPhong.code".
     *             Được validateFieldName() kiểm tra để chống SQL injection.
     * operation : EQUALS / LIKE / IN / GREATER_THAN_OR_EQUAL ... (xem FilterOperation)
     * value     : Object vì có thể là String, Boolean, Number, enum, hoặc List (cho IN).
     *             Jackson tự ép kiểu; value = null thì điều kiện bị bỏ qua.
     * logicType : điều kiện này thuộc nhóm AND hay nhóm OR.
     *             BaseServiceImpl gom riêng 2 nhóm rồi nối:  (AND...) AND (OR...)
     */
    String fieldName;
    FilterOperation operation;
    Object value;
    @Builder.Default
    FilterLogicType logicType = FilterLogicType.AND;
}
