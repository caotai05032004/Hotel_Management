import http from "./http";
import type {
  CheckInRequest,
  DatPhongCreateRequest,
  DatPhongResponse,
} from "../types";

export const datPhongService = {
  async taoDatPhong(data: DatPhongCreateRequest): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>("/dat-phong", data);
    return res.data;
  },

  async layDanhSachCuaToi(): Promise<DatPhongResponse[]> {
    const res = await http.get<DatPhongResponse[]>("/dat-phong/my-bookings");
    return res.data;
  },

  async layChiTiet(id: string): Promise<DatPhongResponse> {
    const res = await http.get<DatPhongResponse>(`/dat-phong/${id}`);
    return res.data;
  },

  async layTatCaDatPhongAdmin(): Promise<DatPhongResponse[]> {
    const res = await http.get<DatPhongResponse[]>("/dat-phong/admin/all");
    return res.data;
  },

  async xacNhanDatPhong(id: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(`/dat-phong/admin/${id}/xac-nhan`);
    return res.data;
  },

  async thanhToanCoc(id: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(`/dat-phong/${id}/thanh-toan-coc`);
    return res.data;
  },

  async checkInLuuTru(
    id: string,
    data: CheckInRequest,
  ): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(
      `/dat-phong/admin/${id}/check-in`,
      data,
    );
    return res.data;
  },

  async doiPhongLuuTru(id: string, phongMoiId: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(
      `/dat-phong/admin/${id}/doi-phong?phongMoiId=${phongMoiId}`
    );
    return res.data;
  },

  async checkOutAdmin(id: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(`/dat-phong/admin/${id}/check-out`);
    return res.data;
  },

  async checkOutGuest(id: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(`/dat-phong/${id}/check-out-guest`);
    return res.data;
  },

  async danhDauNoShow(id: string): Promise<DatPhongResponse> {
    const res = await http.post<DatPhongResponse>(`/dat-phong/admin/${id}/no-show`);
    return res.data;
  },

  async suaDatPhongPending(id: string, data: DatPhongCreateRequest): Promise<DatPhongResponse> {
    const res = await http.put<DatPhongResponse>(`/dat-phong/${id}/sua-pending`, data);
    return res.data;
  },

  async huyDatPhong(id: string): Promise<DatPhongResponse> {
    const res = await http.put<DatPhongResponse>(`/dat-phong/${id}/cancel`);
    return res.data;
  },
};

export default datPhongService;
