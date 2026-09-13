import { request } from './http';
import type {
  BaseFilterRequest,
  BaseResponsePaging,
  PhongRequest,
  PhongResponse,
  PhongTrangThaiRequest,
} from '../types';

/* =========================================================================
 * PhongController — /api/phong (toàn bộ yêu cầu đăng nhập nhân viên)
 *   POST   /filter              (RECEPTIONIST | MANAGER | ADMIN)
 *   GET    /{id}                (RECEPTIONIST | MANAGER | ADMIN)
 *   POST   /                    (MANAGER | ADMIN)
 *   PUT    /{id}                (MANAGER | ADMIN)
 *   PATCH  /{id}/trang-thai     (RECEPTIONIST | MANAGER | ADMIN)
 *   DELETE /{id}                (MANAGER | ADMIN)
 * ======================================================================= */

export const phongService = {
  filter(payload: BaseFilterRequest = {}) {
    const body: BaseFilterRequest = {
      filters: payload.filters ?? [],
      sorts: payload.sorts ?? [],
      page: payload.page ?? 0,
      size: payload.size ?? 20,
    };
    return request<BaseResponsePaging<PhongResponse>>({
      url: '/phong/filter',
      method: 'POST',
      data: body,
    });
  },

  getById(id: string) {
    return request<PhongResponse>({ url: `/phong/${id}`, method: 'GET' });
  },

  create(payload: PhongRequest) {
    return request<PhongResponse>({ url: '/phong', method: 'POST', data: payload });
  },

  update(id: string, payload: PhongRequest) {
    return request<PhongResponse>({ url: `/phong/${id}`, method: 'PUT', data: payload });
  },

  updateTrangThai(id: string, payload: PhongTrangThaiRequest) {
    return request<PhongResponse>({
      url: `/phong/${id}/trang-thai`,
      method: 'PATCH',
      data: payload,
    });
  },

  remove(id: string) {
    return request<void>({ url: `/phong/${id}`, method: 'DELETE' });
  },
};

export default phongService;
