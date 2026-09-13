import { request } from './http';
import type { NguoiDungResponse, UpdateNguoiDungRequest } from '../types';

/* =========================================================================
 * NguoiDungController — /api/user   (cần đăng nhập)
 *   GET  /api/user/user/{id} -> BaseResponse<NguoiDungResponse>
 *   POST /api/user/update    -> BaseResponse<NguoiDungResponse>
 *        (backend tìm người dùng theo email trong request)
 * ======================================================================= */
export const nguoiDungService = {
  getById(id: string) {
    return request<NguoiDungResponse>({ url: `/user/user/${id}`, method: 'GET' });
  },

  update(payload: UpdateNguoiDungRequest) {
    return request<NguoiDungResponse>({ url: '/user/update', method: 'POST', data: payload });
  },
};

export default nguoiDungService;
