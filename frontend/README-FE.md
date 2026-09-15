# Frontend — PhucNguyen Resort & Tour Hub

React 19 + TypeScript + Vite + **Tailwind CSS v4**. Giao diện bám theo template
homepage Figma: <https://join-truce-32939589.figma.site/>

```bash
npm install
npm run dev      # http://localhost:5173  (proxy /api -> http://localhost:8080)
npm run build    # tsc -b && vite build
```

Backend phải chạy ở `http://localhost:8080` (xem `app.cors.allowed-origins` trong
`application.yml` — đã cho phép sẵn `http://localhost:5173`).

---

## 1. Bản đồ API — mọi lời gọi đều nằm trong `src/services`

| File service          | Endpoint backend                          | Hàm FE                                    | Dùng ở màn hình                         |
| --------------------- | ----------------------------------------- | ----------------------------------------- | --------------------------------------- |
| `authService.ts`      | `POST /api/auth/register`                 | `authService.register`                    | `/register`                             |
|                       | `POST /api/auth/login`                    | `authService.login`                       | `/login`                                |
|                       | `POST /api/auth/logout`                   | `authService.logout`                      | Header, AdminLayout                     |
| `nguoiDungService.ts` | `GET /api/user/user/{id}`                 | `nguoiDungService.getById`                | `/profile`, `/admin/tai-khoan`          |
|                       | `POST /api/user/update`                   | `nguoiDungService.update`                 | `/profile`, `/admin/tai-khoan`          |
| `hangPhongService.ts` | `POST /api/hang-phong/filter`             | `filter` / `listActive` / `listForGuests` | Homepage, `/rooms`, `/admin/hang-phong` |
|                       | `GET /api/hang-phong/{id}`                | `getById`                                 | `/rooms/:id`, modal ảnh                 |
|                       | `POST /api/hang-phong`                    | `create`                                  | `/admin/hang-phong`                     |
|                       | `PUT /api/hang-phong/{id}`                | `update`                                  | `/admin/hang-phong`                     |
|                       | `PATCH /api/hang-phong/{id}/active`       | `setActive`                               | `/admin/hang-phong`                     |
|                       | `POST /api/hang-phong/{id}/anh`           | `addImage`                                | Modal "Ảnh"                             |
|                       | `DELETE /api/hang-phong/{id}/anh/{anhId}` | `removeImage`                             | Modal "Ảnh"                             |
| `phongService.ts`     | `POST /api/phong/filter`                  | `filter`                                  | `/admin/phong`, Dashboard               |
|                       | `GET /api/phong/{id}`                     | `getById`                                 | — (sẵn sàng dùng)                       |
|                       | `POST /api/phong`                         | `create`                                  | `/admin/phong`                          |
|                       | `PUT /api/phong/{id}`                     | `update`                                  | `/admin/phong`                          |
|                       | `PATCH /api/phong/{id}/trang-thai`        | `updateTrangThai`                         | Modal "Trạng thái"                      |
|                       | `DELETE /api/phong/{id}`                  | `remove`                                  | `/admin/phong`                          |

`src/services/http.ts` là lớp dùng chung:

- `baseURL = /api` (đổi bằng biến môi trường `VITE_API_BASE_URL` khi deploy);
- interceptor request tự gắn `Authorization: Bearer <accessToken>`;
- interceptor response gặp `401` thì xoá phiên và chuyển về `/login?expired=1`;
- `unwrap()` bóc `BaseResponse<T>` và **ném `ApiError` khi `code` không phải 2xx** —
  cần thiết vì backend trả HTTP 200 kèm `code: 400` ở nhiều nghiệp vụ (ví dụ login sai mật khẩu);
- `getErrorMessage()` / `getFieldErrors()` đọc cả `BaseResponse.msg` lẫn body
  `{message, errors}` của `GlobalExceptionHandler`.

## 2. Bản đồ màn hình

| Route                 | Mô tả                                                                                                                                            | Quyền                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `/`                   | Homepage đúng template: hero, thanh tìm phòng, thống kê, **Phòng & Villa (dữ liệu thật từ API)**, Tour, F&B, Tại sao chọn, Đánh giá, CTA, Footer | Public                          |
| `/rooms`              | Catalog hạng phòng: lọc theo tên, số khách, sắp xếp giá, phân trang                                                                              | Public                          |
| `/rooms/:id`          | Chi tiết hạng phòng: gallery ảnh, tiện nghi, sức chứa, giá                                                                                       | Public                          |
| `/login`, `/register` | Đăng nhập / đăng ký (validate khớp annotation của `RegisterRequest`)                                                                             | Public                          |
| `/profile`            | Xem & cập nhật hồ sơ cá nhân                                                                                                                     | Đăng nhập                       |
| `/admin`              | Dashboard: tổng hợp số liệu hạng phòng + phòng                                                                                                   | RECEPTIONIST/MANAGER/ADMIN      |
| `/admin/hang-phong`   | CRUD hạng phòng, bật/tắt kinh doanh, quản lý ảnh                                                                                                 | xem: staff · sửa: MANAGER/ADMIN |
| `/admin/phong`        | CRUD phòng, lọc đa điều kiện, đổi trạng thái vệ sinh/kỹ thuật, xoá                                                                               | xem: staff · sửa: MANAGER/ADMIN |
| `/admin/tai-khoan`    | Tra cứu người dùng theo ID và cập nhật                                                                                                           | staff                           |

Vai trò lấy từ `LoginResponse.vaiTro`; `id` người dùng lấy từ claim `uid` trong
access token (vì `LoginResponse` không trả `id`) — xem `src/lib/jwt.ts`.

## 3. Những điểm cần chỉnh ở BACKEND

1. **Khách chưa đăng nhập không xem được danh sách phòng.**
   `SecurityConfig` mới chỉ `permitAll` cho `GET /api/hang-phong/**`, trong khi
   danh sách dùng `POST /api/hang-phong/filter` → khách vãng lai bị `401`.
   Thêm vào `authorizeHttpRequests`:

   ```java
   .requestMatchers(HttpMethod.POST, "/api/hang-phong/filter").permitAll()
   ```

   Hiện FE đã xử lý mềm: homepage hiện cảnh báo thay vì vỡ trang.

2. **`POST /api/user/update` chưa lưu tường minh.**
   `NguoiDungService.update()` set field nhưng không gọi `nguoiDungRepository.save(...)`,
   và không có `@Transactional` trên chính method. Nên thêm cả hai cho chắc.
   Ngoài ra endpoint luôn `passwordEncoder.encode(request.getPassword())` nên FE
   **bắt buộc** nhập mật khẩu mới mỗi lần cập nhật — nếu muốn cho phép bỏ trống thì
   backend cần kiểm tra `if (StringUtils.isNotBlank(request.getPassword()))`.

3. **Chưa có API cho các mục còn lại của homepage** (Tour, Nhà hàng/F&B, đặt phòng,
   hóa đơn). Các section đó hiện là dữ liệu tĩnh đúng theo template, đã đánh dấu
   `TODO` trong code (`ToursSection.tsx`, `DiningSection.tsx`, nút "Đặt phòng" ở
   `RoomDetail.tsx`). Khi có `TourController` / `DatPhongController`, chỉ cần thêm
   file service tương ứng vào `src/services` và thay mảng dữ liệu tĩnh.

4. `NguoiDungController` đang map `GET /api/user/user/{id}` (lặp "user"). Nếu đổi
   thành `/api/user/{id}` thì sửa lại một dòng trong `nguoiDungService.ts`.

## 4. Ghi chú khác

- `antd` / `@ant-design/icons` không còn được dùng (toàn bộ UI viết bằng Tailwind).
  Có thể gỡ khỏi `package.json` nếu muốn gọn.
- `src/App.css` là file mẫu của Vite, không được import ở đâu.
- Design token (navy `#0D1B2A`, ink `#1A1A2E`, gold `#C9A84C`, cream `#FAF7F2`)
  khai báo trong `@theme` ở `src/index.css`, lấy trực tiếp từ template Figma.
- Ảnh minh hoạ dùng Unsplash làm fallback; khi hạng phòng có ảnh trong
  `anh_hang_phong` thì FE tự động dùng ảnh thật.
