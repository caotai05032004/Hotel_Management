package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;

@Entity
@Table(name = "gia_phong_theo_ngay")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GiaPhongTheoNgay {
    @EmbeddedId
    @AttributeOverride(name = "date", column = @Column(name = "rate_date", nullable = false))
    private HangPhongNgayId id;

    @MapsId("hangPhongId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hang_phong_id", nullable = false)
    private HangPhong hangPhong;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
}
