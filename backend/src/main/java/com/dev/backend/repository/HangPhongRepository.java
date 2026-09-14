package com.dev.backend.repository;

import com.dev.backend.entity.HangPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface HangPhongRepository extends JpaRepository<HangPhong, String>,
        JpaSpecificationExecutor<HangPhong> {

    boolean existsByCode(String code);

    // Dùng khi update: mã trùng với hạng phòng KHÁC (không tính chính nó)
    boolean existsByCodeAndIdNot(String code, String id);
}
