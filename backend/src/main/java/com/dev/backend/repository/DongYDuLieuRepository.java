package com.dev.backend.repository;

import com.dev.backend.entity.DongYDuLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DongYDuLieuRepository extends JpaRepository<DongYDuLieu, String> {
    List<DongYDuLieu> findByNguoiDung_Id(String nguoiDungId);
}
