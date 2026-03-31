import React from 'react';
import { Link } from 'react-router-dom';

const AccessDeniedPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', color: '#dc3545' }}>🚫</h1>
      <h2 style={{ fontSize: '2rem',color: '#282626ff', marginBottom: '1rem' }}>Truy Cập Bị Từ Chối</h2>
      <p style={{ marginBottom: '2rem', color: '#282626ff', fontSize: '1.1rem' }}>Rất tiếc, bạn không có quyền truy cập vào trang này.</p>
      <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Quay về Trang Chủ
      </Link>
    </div>
  );
};

export default AccessDeniedPage;