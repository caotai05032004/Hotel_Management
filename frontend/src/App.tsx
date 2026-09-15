import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/RequireAuth';

import Home from './page/Home';
import Rooms from './page/Rooms';
import RoomDetail from './page/RoomDetail';
import Profile from './page/Profile';
import Forbidden from './page/Forbidden';
import NotFound from './page/NotFound';
import Login from './page/auth/Login';
import Register from './page/auth/Register';

import Dashboard from './page/admin/Dashboard';
import HangPhongPage from './page/admin/HangPhongPage';
import PhongPage from './page/admin/PhongPage';
import TaiKhoanPage from './page/admin/TaiKhoanPage';
import DatPhongPage from './page/admin/DatPhongPage';
import YeuCauDuLieuPage from './page/admin/YeuCauDuLieuPage';
import MyBookings from './page/MyBookings';
import AboutMe from './page/AboutMe';
import PATH from './configs/path';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --------- Trang không có header/footer --------- */}
        <Route path={PATH.LOGIN} element={<Login />} />
        <Route path={PATH.REGISTER} element={<Register />} />

        {/* --------------- Trang khách -------------------- */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path={PATH.ROOMS} element={<Rooms />} />
          <Route path={PATH.ROOM_DETAIL} element={<RoomDetail />} />
          <Route path={PATH.ABOUT_ME} element={<AboutMe />} />

          {/* Không có quyền truy cập */}
          <Route path={PATH.FORBIDDEN} element={<Forbidden />} />

          {/* Cần đăng nhập */}
          <Route element={<RequireAuth />}>
            <Route path={PATH.PROFILE} element={<Profile />} />
            <Route path={PATH.MY_BOOKINGS} element={<MyBookings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* --------------- Khu quản trị ------------------- */}
        <Route element={<RequireAuth roles={['RECEPTIONIST', 'MANAGER', 'ADMIN']} />}>
          <Route path={PATH.ADMIN} element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path={PATH.ADMIN_ROOM_TYPES} element={<HangPhongPage />} />
            <Route path={PATH.ADMIN_ROOMS} element={<PhongPage />} />
            <Route path={PATH.ADMIN_RESERVATIONS} element={<DatPhongPage />} />
            <Route path={PATH.ADMIN_DATA_REQUESTS} element={<YeuCauDuLieuPage />} />
            <Route path={PATH.ADMIN_ACCOUNTS} element={<TaiKhoanPage />} />
            <Route path="*" element={<Navigate to={PATH.ADMIN} replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
