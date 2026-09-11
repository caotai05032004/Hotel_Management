package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "anh_hang_phong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnhHangPhong extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hang_phong_id", nullable = false)
    private HangPhong hangPhong;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 200)
    private String caption;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
