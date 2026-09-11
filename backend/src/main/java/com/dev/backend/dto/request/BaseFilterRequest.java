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
    @Builder.Default
    List<FilterCriteria> filters = new ArrayList<>();
    @Builder.Default
    List<SortCriteria> sorts = new ArrayList<>();
    @Builder.Default
    Integer page = 0;
    @Builder.Default
    Integer size = 20;
}
