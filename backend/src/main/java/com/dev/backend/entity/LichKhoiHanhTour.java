package com.dev.backend.entity;

import com.dev.backend.constant.enums.DepartureStatus;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "lich_khoi_hanh_tour")
@AttributeOverride(name = "id", column = @Column(name = "id", length = 36))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichKhoiHanhTour extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "departure_time")
    private LocalTime departureTime;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "booked_seats", nullable = false)
    @Builder.Default
    private Integer bookedSeats = 0;

    /** Hướng dẫn viên (TOUR_GUIDE). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id")
    private NguoiDung guide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DepartureStatus status = DepartureStatus.SCHEDULED;

    @OneToMany(mappedBy = "lichKhoiHanh")
    @Builder.Default
    private List<DatTour> bookings = new ArrayList<>();
}
