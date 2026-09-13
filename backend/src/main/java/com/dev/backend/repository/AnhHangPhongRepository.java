package com.dev.backend.repository;

import com.dev.backend.entity.AnhHangPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnhHangPhongRepository extends JpaRepository<AnhHangPhong, String>,
        JpaSpecificationExecutor<AnhHangPhong> {

    // hangPhong là tên field trong entity AnhHangPhong, Id là field của HangPhong
    List<AnhHangPhong> findByHangPhong_IdOrderBySortOrderAsc(String hangPhongId);
}
