package com.dev.backend.entity;

import com.dev.backend.constant.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dat_phong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DatPhong extends BaseEntity {
    @Column(name = "booking_code", nullable = false, length = 20, unique = true)
    private String bookingCode;

    /** NULL = đặt tại quầy cho khách vãng lai. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "contact_name", nullable = false, length = 150)
    private String contactName;

    @Column(name = "contact_email", length = 190)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "num_adults", nullable = false)
    @Builder.Default
    private Integer numAdults = 1;

    @Column(name = "num_children", nullable = false)
    @Builder.Default
    private Integer numChildren = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "deposit_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "estimated_total", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal estimatedTotal = BigDecimal.ZERO;

    @Column(name = "special_request", length = 500)
    private String specialRequest;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "refund_amount", precision = 15, scale = 2)
    private BigDecimal refundAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private NguoiDung createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDatPhong> details = new ArrayList<>();

    @OneToOne(mappedBy = "datPhong", fetch = FetchType.LAZY)
    private SoKhach soKhach;
}
