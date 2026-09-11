package com.dev.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

/** Khóa kép (hang_phong_id, date) — dùng chung cho gia_phong_theo_ngay và ton_kho_phong. */
@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class HangPhongNgayId implements Serializable {

    @Column(name = "hang_phong_id", length = 36, nullable = false)
    private String hangPhongId;

    @Column(name = "stay_date", nullable = false)
    private LocalDate date;
}
