import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./CategoryPage.css";

// Component cho một hàng trong bảng
const CategoryRow = ({ category, index, token, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      try {
        const response = await fetch(`http://localhost:8888/api/v1/categories/${category.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Có lỗi xảy ra khi xóa danh mục.");
        }

        alert(`Đã xóa thành công danh mục: ${category.name}`);
        onDelete(category.id);
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{category.name}</td>
      <td>
        <div className="action-buttons">
          <Link to={`/admin/danhmuc/sua/${category.id}`} className="action-button edit-button">
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

const CategoryPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeCategoryFromState = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8888/api/v1/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể tải danh sách danh mục.");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  return (
    <div className="category-page">
      <h1 className="page-title">QUẢN LÝ DANH MỤC</h1>

      <div className="toolbar">
        <div className="search-container">
          <img src="/image/kinhlup.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Tìm kiếm ..." className="search-input" />
        </div>
        <Link to="/admin/danhmuc/them" className="add-new-button">
          <img src="/image/daucong.png" alt="Thêm mới" />
        </Link>
      </div>

      <div className="table-container">
        <table className="category-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên Danh Mục</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3">Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan="3" style={{ color: "red" }}>Lỗi: {error}</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="3">Chưa có danh mục nào</td></tr>
            ) : (
              categories.map((cat, index) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  index={index}
                  token={token}
                  onDelete={removeCategoryFromState}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryPage;
