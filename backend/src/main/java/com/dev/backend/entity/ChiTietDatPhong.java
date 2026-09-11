package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chi_tiet_dat_phong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietDatPhong extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dat_phong_id", nullable = false)
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hang_phong_id", nullable = false)
    private HangPhong hangPhong;

    /** Gán lúc check-in. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Column(name = "rate_per_night", nullable = false, precision = 15, scale = 2)
    private BigDecimal ratePerNight;

    @Column(name = "actual_check_in")
    private LocalDateTime actualCheckIn;

    @Column(name = "actual_check_out")
    private LocalDateTime actualCheckOut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    private NguoiDung checkedInBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_out_by")
    private NguoiDung checkedOutBy;

    @OneToMany(mappedBy = "chiTietDatPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KhaiBaoLuuTru> declarations = new ArrayList<>();
}
