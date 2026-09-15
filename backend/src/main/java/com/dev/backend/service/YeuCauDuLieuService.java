package com.dev.backend.service;

import com.dev.backend.dto.response.YeuCauDuLieuResponse;

import java.util.List;

public interface YeuCauDuLieuService {
    YeuCauDuLieuResponse guiYeuCauXoa(String username, String reason);
    List<YeuCauDuLieuResponse> layTatCaYeuCauAdmin();
    YeuCauDuLieuResponse duyetYeuCau(String id, String adminUsername);
}
