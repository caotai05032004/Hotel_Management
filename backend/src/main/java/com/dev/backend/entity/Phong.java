package com.dev.backend.entity;

import com.dev.backend.constant.enums.HousekeepingStatus;
import com.dev.backend.constant.enums.OccupancyStatus;
import com.dev.backend.constant.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phong extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hang_phong_id", nullable = false)
    private HangPhong hangPhong;

    @Column(name = "room_number", nullable = false, length = 10, unique = true)
    private String roomNumber;

    @Column(name = "floor_no", nullable = false)
    private Integer floorNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "occupancy_status", nullable = false, length = 20)
    @Builder.Default
    private OccupancyStatus occupancyStatus = OccupancyStatus.VACANT;

    @Enumerated(EnumType.STRING)
    @Column(name = "housekeeping_status", nullable = false, length = 20)
    @Builder.Default
    private HousekeepingStatus housekeepingStatus = HousekeepingStatus.CLEAN;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_status", nullable = false, length = 20)
    @Builder.Default
    private ServiceStatus serviceStatus = ServiceStatus.IN_SERVICE;

    @Column(length = 255)
    private String note;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
