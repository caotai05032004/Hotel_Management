package com.dev.backend.entity;

import com.dev.backend.constant.enums.Gender;
import com.dev.backend.constant.enums.IdType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "khai_bao_luu_tru")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhaiBaoLuuTru extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chi_tiet_dat_phong_id", nullable = false)
    private ChiTietDatPhong chiTietDatPhong;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_type", nullable = false, length = 20)
    private IdType idType;

    @Column(name = "id_number_encrypted", nullable = false, columnDefinition = "VARBINARY(512)")
    private byte[] idNumberEncrypted;

    @Column(nullable = false, length = 80)
    private String nationality;

    @Column(name = "permanent_address", length = 255)
    private String permanentAddress;

    @Column(name = "is_primary_guest", nullable = false)
    @Builder.Default
    private Boolean isPrimaryGuest = false;

    @CreationTimestamp
    @Column(name = "declared_at", nullable = false, updatable = false)
    private LocalDateTime declaredAt;

    @Column(name = "exported_at")
    private LocalDateTime exportedAt;
}
