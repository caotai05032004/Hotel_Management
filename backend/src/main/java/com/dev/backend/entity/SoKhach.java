package com.dev.backend.entity;

import com.dev.backend.constant.enums.OpenClosedStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "so_khach")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SoKhach extends BaseEntity {
    @Column(name = "folio_number", nullable = false, length = 20, unique = true)
    private String folioNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dat_phong_id", nullable = false, unique = true)
    private DatPhong datPhong;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private OpenClosedStatus status = OpenClosedStatus.OPEN;

    @CreationTimestamp
    @Column(name = "opened_at", nullable = false, updatable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    /** Append-only: chỉ thêm, không sửa/xóa (DB có trigger chặn). */
    @OneToMany(mappedBy = "soKhach", cascade = CascadeType.PERSIST)
    @OrderBy("postedAt ASC")
    @Builder.Default
    private List<GiaoDichSoKhach> transactions = new ArrayList<>();
}
