package com.dev.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

/** Khóa chính CHAR(36) UUID, sinh phía ứng dụng (tương đương DEFAULT (UUID()) của DB). */
@MappedSuperclass
@Getter @Setter
public abstract class BaseEntity {

    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;
}
