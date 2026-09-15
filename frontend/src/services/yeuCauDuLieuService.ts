import http from "./http";

export interface YeuCauDuLieuResponse {
  id: string;
  nguoiDungId: string;
  nguoiDungEmail: string;
  nguoiDungHoTen: string;
  requestType: string;
  status: string;
  reason?: string;
  requestedAt: string;
  processedAt?: string;
  processedByEmail?: string;
}

export const yeuCauDuLieuService = {
  async guiYeuCauXoa(reason?: string): Promise<YeuCauDuLieuResponse> {
    const res = await http.post<YeuCauDuLieuResponse>("/yeu-cau-du-lieu/gui-yeu-cau-xoa", { reason });
    return res.data;
  },

  async layTatCaYeuCauAdmin(): Promise<YeuCauDuLieuResponse[]> {
    const res = await http.get<YeuCauDuLieuResponse[]>("/yeu-cau-du-lieu/admin/all");
    return res.data;
  },

  async duyetYeuCau(id: string): Promise<YeuCauDuLieuResponse> {
    const res = await http.post<YeuCauDuLieuResponse>(`/yeu-cau-du-lieu/admin/${id}/duyet`);
    return res.data;
  },
};

export default yeuCauDuLieuService;
