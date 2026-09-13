package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HangPhongResponse {
    String id;
    String code;
    String name;
    String description;
    BigDecimal basePrice;
    Integer maxAdults;
    Integer maxChildren;
    String bedType;
    BigDecimal areaSqm;
    String amenities;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<AnhHangPhongResponse> images;
    Long soPhong;                // số phòng vật lý thuộc hạng này
}
