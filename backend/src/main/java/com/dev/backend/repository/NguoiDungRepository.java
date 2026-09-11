package com.dev.backend.repository;

import com.dev.backend.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JpaRepository            : có sẵn save / findById / findAll / delete...
 * JpaSpecificationExecutor : bắt buộc, vì BaseServiceImpl dùng để filter.
 * ID là String vì cột id của DB là CHAR(36) UUID.
 */
@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, String>,
        JpaSpecificationExecutor<NguoiDung> {

    Optional<NguoiDung> findByEmail(String email);

    boolean existsByEmail(String email);
}
