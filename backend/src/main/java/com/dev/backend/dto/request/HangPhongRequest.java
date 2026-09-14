package com.dev.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/** Dùng chung cho tạo mới và cập nhật hạng phòng. */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HangPhongRequest {

    @NotBlank(message = "Mã hạng phòng không được để trống")
    @Size(max = 20)
    String code;                 // DLX, STE, VIL...

    @NotBlank(message = "Tên hạng phòng không được để trống")
    @Size(max = 120)
    String name;

    String description;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0", message = "Giá không được âm")
    BigDecimal basePrice;

    @Min(1) @Max(10)
    Integer maxAdults;

    @Min(0) @Max(10)
    Integer maxChildren;

    @Size(max = 60)
    String bedType;

    BigDecimal areaSqm;

    String amenities;            // chuỗi JSON, vd: ["wifi","tv","minibar"]
}
