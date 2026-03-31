import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './SidebarAdmin';
import AdminHeader from './HeaderAdmin';
import './AdminLayout.css'; // File CSS cho layout

const AdminLayout = () => {
  return (
    // Container chính sử dụng Flexbox
    <div className="admin-layout-container">
      {/* Sidebar chiếm một phần chiều rộng cố định */}
      <AdminSidebar />

      {/* Wrapper cho nội dung chính, chiếm phần không gian còn lại */}
      <div className="main-content-wrapper">
        {/* Header nằm trên cùng của nội dung chính */}
        <AdminHeader />

        {/* Khu vực hiển thị nội dung của từng trang con */}
        <main className="main-content">
          <Outlet /> {/* Các trang con sẽ được render ở đây */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
