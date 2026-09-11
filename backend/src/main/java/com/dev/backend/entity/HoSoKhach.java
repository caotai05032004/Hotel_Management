package com.dev.backend.entity;

import com.dev.backend.constant.enums.Gender;
import com.dev.backend.constant.enums.IdType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "ho_so_khach")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoSoKhach extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false, unique = true)
    private NguoiDung nguoiDung;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_type", nullable = false, length = 20)
    @Builder.Default
    private IdType idType = IdType.CCCD;

    /** Mã hóa AES phía ứng dụng. */
    @Column(name = "id_number_encrypted", columnDefinition = "VARBINARY(512)")
    private byte[] idNumberEncrypted;

    @Column(name = "id_number_hash", length = 64)
    private String idNumberHash;

    @Column(name = "id_issued_date")
    private LocalDate idIssuedDate;

    @Column(name = "id_issued_place", length = 150)
    private String idIssuedPlace;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 80)
    private String nationality;

    @Column(name = "permanent_address", length = 255)
    private String permanentAddress;

    @Column(name = "id_document_image_url", length = 500)
    private String idDocumentImageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
