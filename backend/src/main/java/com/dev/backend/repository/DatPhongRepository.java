package com.dev.backend.repository;

import com.dev.backend.entity.DatPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatPhongRepository extends JpaRepository<DatPhong, String>,
        JpaSpecificationExecutor<DatPhong> {

    List<DatPhong> findByNguoiDung_IdOrderByCreatedAtDesc(String nguoiDungId);

    Optional<DatPhong> findByBookingCode(String bookingCode);

    List<DatPhong> findAllByOrderByCreatedAtDesc();
}
