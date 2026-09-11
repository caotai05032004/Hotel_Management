package com.dev.backend.entity;

import com.dev.backend.constant.enums.DataRequestStatus;
import com.dev.backend.constant.enums.DataRequestType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "yeu_cau_du_lieu")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class YeuCauDuLieu extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 20)
    private DataRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DataRequestStatus status = DataRequestStatus.RECEIVED;

    @Column(length = 500)
    private String reason;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private NguoiDung processedBy;
}
