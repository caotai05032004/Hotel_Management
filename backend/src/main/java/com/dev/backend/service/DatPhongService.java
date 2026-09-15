package com.dev.backend.service;

import com.dev.backend.dto.request.CheckInRequest;
import com.dev.backend.dto.request.DatPhongCreateRequest;
import com.dev.backend.dto.response.DatPhongResponse;

import java.util.List;

public interface DatPhongService {
    DatPhongResponse taoDatPhong(DatPhongCreateRequest request, String username);

    List<DatPhongResponse> layDanhSachDatPhongCuaToi(String username);

    List<DatPhongResponse> layTatCaDatPhongAdmin();

    DatPhongResponse layChiTietDatPhong(String id);

    DatPhongResponse xacNhanDatPhong(String datPhongId);

    DatPhongResponse thanhToanCoc(String datPhongId);

    DatPhongResponse checkInLuuTru(String datPhongId, CheckInRequest request);

    DatPhongResponse doiPhongLuuTru(String datPhongId, String phongMoiId);

    DatPhongResponse checkOutLuuTru(String datPhongId);

    DatPhongResponse danhDauNoShow(String datPhongId);

    DatPhongResponse suaDatPhongPending(String datPhongId, DatPhongCreateRequest request);

    DatPhongResponse huyDatPhongWithPolicy(String datPhongId);

    DatPhongResponse huyDatPhong(String datPhongId);
}
