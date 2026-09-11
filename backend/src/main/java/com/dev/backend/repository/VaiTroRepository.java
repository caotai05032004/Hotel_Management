package com.dev.backend.repository;

import com.dev.backend.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, String>,
        JpaSpecificationExecutor<VaiTro> {

    Optional<VaiTro> findByCode(String code);   // GUEST, RECEPTIONIST, ADMIN...
}
