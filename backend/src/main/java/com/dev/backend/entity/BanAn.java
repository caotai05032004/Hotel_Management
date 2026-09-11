package com.dev.backend.entity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "ban_an")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BanAn extends BaseEntity {
    @Column(name = "table_number", nullable = false, length = 10, unique = true)
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 50)
    private String zone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
