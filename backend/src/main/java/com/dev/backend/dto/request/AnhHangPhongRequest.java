package com.dev.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnhHangPhongRequest {

    @NotBlank(message = "URL ảnh không được để trống")
    @Size(max = 500)
    String imageUrl;

    @Size(max = 200)
    String caption;

    Integer sortOrder;
}
