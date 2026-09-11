package com.dev.backend.entity;

import com.dev.backend.constant.enums.PaymentMethod;
import com.dev.backend.constant.enums.PaymentScope;
import com.dev.backend.constant.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;


import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "thanh_toan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThanhToan extends BaseEntity {
    @Column(name = "payment_code", nullable = false, length = 30, unique = true)
    private String paymentCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_scope", nullable = false, length = 20)
    private PaymentScope paymentScope;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dat_phong_id")
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_id")
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dat_tour_id")
    private DatTour datTour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_mon_id")
    private DonMon donMon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.INITIATED;

    @Column(name = "gateway_txn_id", length = 100)
    private String gatewayTxnId;

    @Column(name = "gateway_response", columnDefinition = "JSON")
    private String gatewayResponse;

    /** Hoàn tiền: trỏ tới giao dịch gốc. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_of_id")
    private ThanhToan refundOf;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
