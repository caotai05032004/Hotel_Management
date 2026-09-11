package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_don_mon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietDonMon extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "don_mon_id", nullable = false)
    private DonMon donMon;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mon_an_id", nullable = false)
    private MonAn monAn;

    @Column(nullable = false)
    private Integer quantity;

    /** Snapshot giá lúc gọi món. */
    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 200)
    private String note;

    /** Cột sinh = quantity * unit_price — chỉ đọc. */
    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "line_total", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal lineTotal;
}
