package com.dev.backend.repository;

import com.dev.backend.entity.ChiTietDatPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietDatPhongRepository extends JpaRepository<ChiTietDatPhong, String>,
        JpaSpecificationExecutor<ChiTietDatPhong> {

    // Phòng đã từng được gán cho một lượt lưu trú nào chưa -> quyết định có được xóa không
    boolean existsByPhong_Id(String phongId);
}
