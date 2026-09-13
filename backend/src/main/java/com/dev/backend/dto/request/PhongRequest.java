package com.dev.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/** Tạo mới / cập nhật thông tin cơ bản của phòng vật lý. */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhongRequest {

    @NotBlank(message = "Hạng phòng không được để trống")
    String hangPhongId;

    @NotBlank(message = "Số phòng không được để trống")
    @Size(max = 10)
    String roomNumber;           // 101, 205, V01...

    @NotNull(message = "Tầng không được để trống")
    Integer floorNo;

    @Size(max = 255)
    String note;
}
