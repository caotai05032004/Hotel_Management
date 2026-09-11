package com.dev.backend.entity;

import com.dev.backend.constant.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hoa_don")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDon extends BaseEntity {
    @Column(name = "invoice_number", nullable = false, length = 30, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "so_khach_id", nullable = false)
    private SoKhach soKhach;

    @Column(name = "room_subtotal", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal roomSubtotal = BigDecimal.ZERO;

    @Column(name = "fnb_subtotal", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fnbSubtotal = BigDecimal.ZERO;

    @Column(name = "tour_subtotal", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tourSubtotal = BigDecimal.ZERO;

    @Column(name = "service_charge_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal serviceChargeRate = new BigDecimal("5.00");

    @Column(name = "service_charge", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal serviceCharge = BigDecimal.ZERO;

    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal vatRate = new BigDecimal("8.00");

    @Column(name = "vat_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "deposit_applied", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal depositApplied = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private NguoiDung issuedBy;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ChiTietHoaDon> lines = new ArrayList<>();
}
