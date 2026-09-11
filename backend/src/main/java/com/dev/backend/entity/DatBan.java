package com.dev.backend.entity;

import com.dev.backend.constant.enums.TableReservationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


@Entity
@Table(name = "dat_ban")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatBan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    /**
     * Khách đang lưu trú (tùy chọn).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dat_phong_id")
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ban_an_id", nullable = false)
    private BanAn banAn;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "slot_start", nullable = false)
    private LocalTime slotStart;

    @Column(name = "slot_end", nullable = false)
    private LocalTime slotEnd;

    @Column(name = "party_size", nullable = false)
    private Integer partySize;

    @Column(name = "contact_name", nullable = false, length = 150)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TableReservationStatus status = TableReservationStatus.CONFIRMED;

    @Column(length = 300)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Cột sinh (GENERATED ALWAYS) — chỉ đọc.
     */
    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "active_slot", length = 1, insertable = false, updatable = false)
    private String activeSlot;
}
