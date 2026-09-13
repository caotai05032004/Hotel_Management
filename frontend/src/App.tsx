import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --------- Trang không có header/footer --------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --------------- Trang khách -------------------- */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Cần đăng nhập */}
            <Route element={<RequireAuth />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* --------------- Khu quản trị ------------------- */}
          <Route element={<RequireAuth roles={['RECEPTIONIST', 'MANAGER', 'ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="hang-phong" element={<HangPhongPage />} />
              <Route path="phong" element={<PhongPage />} />
              <Route path="tai-khoan" element={<TaiKhoanPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
