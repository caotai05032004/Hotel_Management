import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './page/auth/Login';
import Register from './page/auth/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}