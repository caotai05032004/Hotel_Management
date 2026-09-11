package com.dev.backend.entity;

import com.dev.backend.constant.enums.Direction;
import com.dev.backend.constant.enums.SourceRefType;
import com.dev.backend.constant.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "giao_dich_so_khach")
@org.hibernate.annotations.Immutable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GiaoDichSoKhach extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "so_khach_id", nullable = false, updatable = false)
    private SoKhach soKhach;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20, updatable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, updatable = false)
    private Direction direction;

    @Column(nullable = false, precision = 15, scale = 2, updatable = false)
    private BigDecimal amount;

    /** Cột sinh: DEBIT = +amount, CREDIT = -amount — chỉ đọc. */
    @Generated(event = EventType.INSERT)
    @Column(name = "signed_amount", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal signedAmount;

    @Column(nullable = false, length = 255, updatable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_ref_type", nullable = false, length = 20, updatable = false)
    private SourceRefType sourceRefType;

    /** Đa hình theo sourceRefType — không map FK. */
    @Column(name = "source_ref_id", length = 36, updatable = false)
    private String sourceRefId;

    @Column(name = "business_date", nullable = false, updatable = false)
    private LocalDate businessDate;

    @CreationTimestamp
    @Column(name = "posted_at", nullable = false, updatable = false)
    private LocalDateTime postedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", updatable = false)
    private NguoiDung postedBy;

    /** Dòng đối ứng: trỏ tới giao dịch bị đảo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id", updatable = false)
    private GiaoDichSoKhach reversalOf;
}
