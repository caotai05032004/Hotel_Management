package com.dev.backend.repository;

import com.dev.backend.entity.KhaiBaoLuuTru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhaiBaoLuuTruRepository extends JpaRepository<KhaiBaoLuuTru, String> {
    List<KhaiBaoLuuTru> findByChiTietDatPhong_Id(String chiTietDatPhongId);
}
