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
@Table(name = "tour")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tour extends BaseEntity {
    @Column(nullable = false, length = 20, unique = true)
    private String code;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String itinerary;

    @Column(name = "duration_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal durationHours;

    @Column(name = "price_per_person", nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerPerson;

    @Column(name = "min_participants", nullable = false)
    @Builder.Default
    private Integer minParticipants = 1;

    @Column(name = "meeting_point", length = 255)
    private String meetingPoint;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "safety_warning", nullable = false, columnDefinition = "TEXT")
    private String safetyWarning;

    @Column(name = "insurance_info", nullable = false, columnDefinition = "TEXT")
    private String insuranceInfo;

    @Column(name = "refund_policy", nullable = false, columnDefinition = "TEXT")
    private String refundPolicy;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<AnhTour> images = new ArrayList<>();

    @OneToMany(mappedBy = "tour")
    @Builder.Default
    private List<LichKhoiHanhTour> departures = new ArrayList<>();
}
