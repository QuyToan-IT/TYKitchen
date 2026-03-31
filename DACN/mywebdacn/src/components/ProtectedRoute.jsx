import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // 1. Trong khi đang kiểm tra token, hiển thị một trạng thái chờ
  if (isLoading) {
    return <div>Đang tải và xác thực...</div>; // Hoặc một component Spinner đẹp hơn
  }

  // 2. Nếu đã kiểm tra xong và người dùng chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu đã đăng nhập nhưng không phải là ADMIN
  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  // 4. Nếu đã đăng nhập và là ADMIN, cho phép truy cập
  return children ? children : <Outlet />;
};

export default ProtectedRoute;