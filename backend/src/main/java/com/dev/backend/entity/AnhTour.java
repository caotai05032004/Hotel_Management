package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "anh_tour")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnhTour extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 200)
    private String caption;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
