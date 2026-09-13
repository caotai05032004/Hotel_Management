package com.dev.backend.repository;

import com.dev.backend.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String>,
        JpaSpecificationExecutor<Phong> {

    boolean existsByRoomNumber(String roomNumber);

    boolean existsByRoomNumberAndIdNot(String roomNumber, String id);

    long countByHangPhong_Id(String hangPhongId);
}
