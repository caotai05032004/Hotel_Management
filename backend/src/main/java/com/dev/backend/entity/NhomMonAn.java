package com.dev.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nhom_mon_an")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhomMonAn extends BaseEntity {
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "nhomMonAn")
    @Builder.Default
    private List<MonAn> items = new ArrayList<>();
}
