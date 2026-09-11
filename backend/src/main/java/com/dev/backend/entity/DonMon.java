package com.dev.backend.entity;

import com.dev.backend.constant.enums.OrderStatus;
import com.dev.backend.constant.enums.OrderType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "don_mon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonMon extends BaseEntity {
    @Column(name = "order_code", nullable = false, length = 20, unique = true)
    private String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType;

    /** Bắt buộc khi chargeToRoom = true. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dat_phong_id")
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ban_an_id")
    private BanAn banAn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "charge_to_room", nullable = false)
    @Builder.Default
    private Boolean chargeToRoom = false;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 300)
    private String note;

    @CreationTimestamp
    @Column(name = "ordered_at", nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    @Column(name = "served_at")
    private LocalDateTime servedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by")
    private NguoiDung handledBy;

    @OneToMany(mappedBy = "donMon", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDonMon> items = new ArrayList<>();

    @OneToMany(mappedBy = "donMon", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    @Builder.Default
    private List<LichSuTrangThaiDon> statusHistory = new ArrayList<>();
}
