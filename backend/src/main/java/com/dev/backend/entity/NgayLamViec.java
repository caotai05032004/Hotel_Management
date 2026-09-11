package com.dev.backend.entity;

import com.dev.backend.constant.enums.OpenClosedStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ngay_lam_viec")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NgayLamViec {
    @Id
    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private OpenClosedStatus status = OpenClosedStatus.OPEN;

    @Column(name = "rooms_available", nullable = false)
    @Builder.Default
    private Integer roomsAvailable = 0;

    @Column(name = "rooms_sold", nullable = false)
    @Builder.Default
    private Integer roomsSold = 0;

    @Column(name = "occupancy_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal occupancyRate = BigDecimal.ZERO;

    @Column(name = "room_revenue", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal roomRevenue = BigDecimal.ZERO;

    @Column(name = "fnb_revenue", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fnbRevenue = BigDecimal.ZERO;

    @Column(name = "tour_revenue", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tourRevenue = BigDecimal.ZERO;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by")
    private NguoiDung closedBy;
}
