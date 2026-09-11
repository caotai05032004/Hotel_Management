package com.dev.backend.entity;

import com.dev.backend.constant.enums.LineGroup;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;


@Entity
@Table(name = "chi_tiet_hoa_don")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietHoaDon extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hoa_don_id", nullable = false)
    private HoaDon hoaDon;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_group", nullable = false, length = 10)
    private LineGroup lineGroup;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
