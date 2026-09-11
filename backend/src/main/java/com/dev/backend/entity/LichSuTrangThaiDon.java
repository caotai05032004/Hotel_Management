package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;


@Entity
@Table(name = "lich_su_trang_thai_don")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichSuTrangThaiDon extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "don_mon_id", nullable = false)
    private DonMon donMon;

    /** DB lưu VARCHAR nên giữ String; gán bằng OrderStatus.name(). */
    @Column(name = "from_status", length = 20)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 20)
    private String toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private NguoiDung changedBy;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
}
