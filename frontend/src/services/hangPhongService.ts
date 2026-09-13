import { request } from './http';
import type {
  AnhHangPhongRequest,
  AnhHangPhongResponse,
  BaseFilterRequest,
  BaseResponsePaging,
  HangPhongRequest,
  HangPhongResponse,
} from '../types';

/* =========================================================================
 * HangPhongController — /api/hang-phong
 *   POST   /filter            -> phân trang + lọc          (cần đăng nhập*)
 *   GET    /{id}              -> chi tiết                  (public)
 *   POST   /                  -> tạo           (MANAGER | ADMIN)
 *   PUT    /{id}              -> cập nhật      (MANAGER | ADMIN)
 *   PATCH  /{id}/active?active=true|false      (MANAGER | ADMIN)
 *   POST   /{id}/anh          -> thêm ảnh      (MANAGER | ADMIN)
 *   DELETE /{id}/anh/{anhId}  -> xoá ảnh       (MANAGER | ADMIN)
 *
 * (*) SecurityConfig mới chỉ permitAll cho GET /api/hang-phong/**, còn
 *     /filter là POST nên khách chưa đăng nhập sẽ bị 401. Xem README-FE.md.
 * ======================================================================= */

export const hangPhongService = {
  filter(payload: BaseFilterRequest = {}) {
    const body: BaseFilterRequest = {
      filters: payload.filters ?? [],
      sorts: payload.sorts ?? [],
      page: payload.page ?? 0,
      size: payload.size ?? 20,
    };
    return request<BaseResponsePaging<HangPhongResponse>>({
      url: '/hang-phong/filter',
      method: 'POST',
      data: body,
    });
  },

  getById(id: string) {
    return request<HangPhongResponse>({ url: `/hang-phong/${id}`, method: 'GET' });
  },

  create(payload: HangPhongRequest) {
    return request<HangPhongResponse>({ url: '/hang-phong', method: 'POST', data: payload });
  },

  update(id: string, payload: HangPhongRequest) {
    return request<HangPhongResponse>({ url: `/hang-phong/${id}`, method: 'PUT', data: payload });
  },

  setActive(id: string, active: boolean) {
    return request<HangPhongResponse>({
      url: `/hang-phong/${id}/active`,
      method: 'PATCH',
      params: { active },
    });
  },

  addImage(id: string, payload: AnhHangPhongRequest) {
    return request<AnhHangPhongResponse>({
      url: `/hang-phong/${id}/anh`,
      method: 'POST',
      data: payload,
    });
  },

  removeImage(id: string, anhId: string) {
    return request<void>({ url: `/hang-phong/${id}/anh/${anhId}`, method: 'DELETE' });
  },

  /* ------------------------- Tiện ích cho UI --------------------------- */

  /** Danh sách hạng phòng đang kinh doanh, dùng cho catalog trang khách. */
  listActive(page = 0, size = 12, keyword?: string) {
    return hangPhongService.filter({
      page,
      size,
      filters: [
        { fieldName: 'isActive', operation: 'EQUALS', value: true, logicType: 'AND' },
        ...(keyword
          ? ([{ fieldName: 'name', operation: 'LIKE', value: keyword, logicType: 'AND' }] as const)
          : []),
      ],
      sorts: [{ fieldName: 'basePrice', direction: 'ASC' }],
    });
  },

  /** Hạng phòng chứa được ít nhất `guests` người lớn. */
  listForGuests(guests: number, page = 0, size = 12) {
    return hangPhongService.filter({
      page,
      size,
      filters: [
        { fieldName: 'isActive', operation: 'EQUALS', value: true, logicType: 'AND' },
        { fieldName: 'maxAdults', operation: 'GREATER_THAN_OR_EQUAL', value: guests, logicType: 'AND' },
      ],
      sorts: [{ fieldName: 'basePrice', direction: 'ASC' }],
    });
  },
};

export default hangPhongService;
