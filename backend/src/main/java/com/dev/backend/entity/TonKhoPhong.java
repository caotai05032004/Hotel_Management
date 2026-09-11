package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "ton_kho_phong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TonKhoPhong {
    @EmbeddedId
    private HangPhongNgayId id;

    @MapsId("hangPhongId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hang_phong_id", nullable = false)
    private HangPhong hangPhong;

    @Column(nullable = false)
    private Integer allotment;

    @Column(nullable = false)
    @Builder.Default
    private Integer sold = 0;
}
