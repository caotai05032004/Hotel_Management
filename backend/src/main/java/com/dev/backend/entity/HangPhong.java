package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hang_phong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HangPhong extends BaseEntity {
    @Column(nullable = false, length = 20, unique = true)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "max_adults", nullable = false)
    @Builder.Default
    private Integer maxAdults = 2;

    @Column(name = "max_children", nullable = false)
    @Builder.Default
    private Integer maxChildren = 1;

    @Column(name = "bed_type", length = 60)
    private String bedType;

    @Column(name = "area_sqm", precision = 6, scale = 2)
    private BigDecimal areaSqm;

    /** JSON — parse ở tầng service (hoặc dùng @JdbcTypeCode(SqlTypes.JSON) với Hibernate 6). */
    @Column(columnDefinition = "JSON")
    private String amenities;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "hangPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<AnhHangPhong> images = new ArrayList<>();

    @OneToMany(mappedBy = "hangPhong")
    @Builder.Default
    private List<Phong> rooms = new ArrayList<>();
}
