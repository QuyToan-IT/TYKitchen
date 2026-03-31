import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./TagPage.css"; // dùng lại CSS của danh mục

// Component cho một hàng trong bảng tag
const TagRow = ({ tag, index, token, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tag "${tag.name}"?`)) {
      try {
        const response = await fetch(`http://localhost:8888/api/v1/tags/${tag.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // unauthorized - token invalid/expired
          throw new Error("Unauthorized (401). Vui lòng đăng nhập lại.");
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Có lỗi xảy ra khi xóa tag.");
        }

        alert(`Đã xóa thành công tag: ${tag.name}`);
        onDelete(tag.id);
      } catch (error) {
        console.error("Lỗi khi xóa tag:", error);
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  return (
    <tr>
      <td>{index + 1}</td> {/* STT */}
      <td>{tag.name}</td>   {/* Tên Tag */}
      <td>
        <div className="action-buttons">
          <Link to={`/admin/articles/tags/edit/${tag.id}`} className="action-button edit-button">
            Chỉnh Sửa
          </Link>
          <button onClick={handleDelete} className="action-button delete-button">
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
};

const TagPage = () => {
  const { token, logout } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeTagFromState = (id) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  useEffect(() => {
    const fetchTags = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8888/api/v1/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // token không hợp lệ / hết hạn
          setError("Unauthorized. Vui lòng đăng nhập lại.");
          logout && logout();
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể tải danh sách tag.");
        }

        const data = await response.json();
        setTags(data);
      } catch (err) {
        console.error("Lỗi khi tải tag:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [token, logout]);

  return (
    <div className="category-page">
      <h1 className="page-title">QUẢN LÝ TAG</h1>

      {error && (
        <div style={{ marginBottom: 12, color: "#b91c1c", background: "#fee2e2", padding: 8, borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div className="toolbar">
        <div className="search-container">
          <img src="/image/kinhlup.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Tìm kiếm tag..." className="search-input" />
        </div>
        <Link to="/admin/articles/tags/add" className="add-new-button">
          <img src="/image/daucong.png" alt="Thêm tag" />
        </Link>
      </div>

      <div className="table-container">
        <table className="category-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên Tag</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3">Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan="3" style={{ color: "red" }}>Lỗi: {error}</td></tr>
            ) : tags.length === 0 ? (
              <tr><td colSpan="3">Chưa có tag nào</td></tr>
            ) : (
              tags.map((tag, index) => (
                <TagRow
                  key={tag.id}
                  tag={tag}
                  index={index}
                  token={token}
                  onDelete={removeTagFromState}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TagPage;
