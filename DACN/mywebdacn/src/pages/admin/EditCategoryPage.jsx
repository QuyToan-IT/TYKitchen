import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // 1. Import hook useAuth
import "./EditCategoryPage.css"; // Import file CSS mới

const EditCategoryPage = () => {
  const { id } = useParams(); // Lấy ID từ URL, ví dụ: /admin/danhmuc/sua/1
  const navigate = useNavigate();
  const { token } = useAuth(); // 2. Lấy token từ hook

  // Quản lý nhiều trạng thái hơn
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sử dụng useCallback để tránh tạo lại hàm fetchCategory mỗi lần render
  const fetchCategory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 3. Gọi API thật để lấy chi tiết danh mục
      const response = await fetch(`/api/v1/categories/${id}`);
      if (!response.ok) {
        throw new Error("Không tìm thấy danh mục hoặc có lỗi xảy ra.");
      }
      const data = await response.json();
      setCategoryName(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]); // Phụ thuộc vào `id`

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (categoryName.trim() === "") {
      alert("Tên danh mục không được để trống.");
      return;
    }

    try {
      // 4. Gọi API để cập nhật danh mục
      const response = await fetch(`/api/v1/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Gửi token để xác thực
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Có lỗi xảy ra khi cập nhật danh mục.");
      }

      alert(`Đã cập nhật thành công danh mục!`);
      navigate("/admin/danhmuc"); // Quay lại trang danh sách sau khi lưu

    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return <div className="edit-page-container">Đang tải dữ liệu...</div>;
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="edit-page-container error-message">
        <p>Lỗi: {error}</p>
        <button onClick={() => navigate("/admin/danhmuc")} className="cancel-button">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="edit-page-container">
      <h1 className="edit-page-title">📝 Chỉnh Sửa Danh Mục</h1>
      <p className="category-id-display">ID Danh mục: #{id}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category-name">Tên Danh Mục:</label>
          <input type="text" id="category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required placeholder="Nhập tên danh mục mới..." />
        </div>

        <div className="form-action-buttons">
          <button type="button" onClick={() => navigate("/admin/danhmuc")} className="cancel-button">Hủy Bỏ</button>
          <button type="submit" className="save-button">Lưu Thay Đổi</button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryPage;