package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "vai_tro")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VaiTro extends BaseEntity {
    /** GUEST, RECEPTIONIST, FNB_STAFF, TOUR_GUIDE, MANAGER, ADMIN — dữ liệu nền, không dùng enum Java để Admin có thể thêm vai trò. */
    @Column(nullable = false, length = 30, unique = true)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 255)
    private String description;
}
