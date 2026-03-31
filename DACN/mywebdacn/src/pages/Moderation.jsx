import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Thêm Link và useNavigate
import './Moderation.css';

const Moderation = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API_BASE_URL nên được định nghĩa ở một file config chung
  const API_BASE_URL = 'http://localhost:8888/api/v1'; // Thay bằng địa chỉ API Gateway của bạn

  useEffect(() => {
    const fetchModerationItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Giả sử endpoint của bạn là /recipes/moderation
        // Backend sẽ trả về các mục dựa trên query param `status`
        const url = filter === 'all' 
          ? `${API_BASE_URL}/recipes/moderation/all` 
          : `${API_BASE_URL}/recipes/moderation?status=${filter.toUpperCase()}`;
        
        // Cần thêm header Authorization nếu API yêu cầu xác thực
        // const token = localStorage.getItem('token');
        // const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Yêu cầu thất bại với mã lỗi ${response.status}`);
        }

        const data = await response.json();

        // Giả định backend trả về dữ liệu có cấu trúc { id, title, description, authorName, status }
        const mappedData = data.map(item => ({
          id: item.id,
          type: 'Công thức', // Hardcode vì trang này chỉ duyệt công thức
          title: item.title,
          author: item.authorName, // Giả sử backend trả về authorName
          contentSnippet: item.description, // Giả sử dùng description làm snippet
          status: item.status.toLowerCase(), // Chuyển status về chữ thường
        }));
        setItems(mappedData);
      } catch (err) {
        setError('Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModerationItems();
  }, [filter]);

  const handleAction = async (id, newStatus) => {
    try {
      // Endpoint để cập nhật status, ví dụ: /recipes/1/status
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/recipes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      if (!response.ok) {
        throw new Error('Cập nhật trạng thái thất bại từ server');
      }
      
      // Cập nhật lại UI sau khi thành công
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
      console.error(err);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'approved') return 'status-approved';
    if (status === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  return (
    <div className="moderation-page">
      <div className="page-container">
        <div className="moderation-header">
          <h1 className="moderation-title">Kiểm duyệt nội dung</h1>
          <div className="filter-tabs">
            <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Chờ duyệt</button>
            <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>Đã duyệt</button>
            <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>Đã từ chối</button>
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Tất cả</button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="empty-state error-state">{error}</div>
        ) : (
          <div className="moderation-list">
            {items.length > 0 ? items.map(item => (
            <div key={item.id} className="moderation-card">
              <div className="card-header">
                <span className="item-type">{item.type}</span>
                <span className={`item-status ${getStatusClass(item.status)}`}>
                  {
                    {
                      pending: 'Chờ duyệt',
                      approved: 'Đã duyệt',
                      rejected: 'Đã từ chối'
                    }[item.status]
                  }
                </span>
              </div>
              <div className="card-body">
                {item.title && <h3 className="item-title">{item.title}</h3>}
                <p className="item-snippet">"{item.contentSnippet}"</p>
                <p className="item-author">bởi <strong>{item.author}</strong></p>
                {item.onArticle && <p className="item-context">trên bài viết: <em>{item.onArticle}</em></p>}
              </div>
              <div className="card-actions">
                {/* Nút xem chi tiết luôn hiển thị */}
                <Link to={`/recipes/${item.id}`} className="action-btn view-btn">
                  Xem Chi Tiết
                </Link>

                {/* Các nút duyệt/từ chối chỉ hiển thị cho tab "Chờ duyệt" */}
                {item.status === 'pending' && (
                  <>
                  <button className="action-btn approve-btn" onClick={() => handleAction(item.id, 'approved')}>
                    Duyệt
                  </button>
                  <button className="action-btn reject-btn" onClick={() => handleAction(item.id, 'rejected')}>
                    Từ chối
                  </button>
                  </>
                )}
              </div>
            </div>
            )) : (
            <div className="empty-state">
              <p>Không có mục nào trong danh sách này.</p>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;