package com.dev.backend.repository;

import com.dev.backend.entity.YeuCauDuLieu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface YeuCauDuLieuRepository extends JpaRepository<YeuCauDuLieu, String> {
    List<YeuCauDuLieu> findByNguoiDung_IdOrderByRequestedAtDesc(String nguoiDungId);
    List<YeuCauDuLieu> findAllByOrderByRequestedAtDesc();
}
