package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhat_ky_thong_bao")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhatKyThongBao extends BaseEntity {
    /** EMAIL / SMS — bảng log, giữ String để không sinh thêm enum. */
    @Column(nullable = false, length = 10)
    private String channel;

    @Column(name = "template_code", nullable = false, length = 50)
    private String templateCode;

    @Column(nullable = false, length = 190)
    private String recipient;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "JSON")
    private String payload;

    /** QUEUED / SENT / FAILED. */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = "QUEUED";

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
