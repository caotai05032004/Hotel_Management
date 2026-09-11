package com.dev.backend.entity;

import com.dev.backend.constant.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dat_tour")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DatTour extends BaseEntity {
    @Column(name = "booking_code", nullable = false, length = 20, unique = true)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lich_khoi_hanh_id", nullable = false)
    private LichKhoiHanhTour lichKhoiHanh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    /** Bắt buộc khi chargeToRoom = true. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dat_phong_id")
    private DatPhong datPhong;

    @Column(name = "contact_name", nullable = false, length = 150)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "num_participants", nullable = false)
    private Integer numParticipants;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    /** Cột sinh = num_participants * unit_price — chỉ đọc. */
    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "total_amount", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalAmount;

    @Column(name = "charge_to_room", nullable = false)
    @Builder.Default
    private Boolean chargeToRoom = false;

    /** Chỉ dùng PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "qr_ticket_code", length = 100)
    private String qrTicketCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
