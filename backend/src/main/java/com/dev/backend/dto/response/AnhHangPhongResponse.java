package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnhHangPhongResponse {
    String id;
    String imageUrl;
    String caption;
    Integer sortOrder;
}
