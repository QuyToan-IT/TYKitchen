import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // 1. Import hook useAuth
import "./AddCategoryPage.css"; // Sử dụng CSS riêng cho trang thêm mới

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const { token } = useAuth(); // 2. Lấy token từ hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (categoryName.trim() === "") {
      alert("Tên danh mục không được để trống.");
      return;
    }

    try {
      // URL API đã được cập nhật để khớp với backend
      const response = await fetch("/api/v1/categories", { // <-- Sửa ở đây
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 3. Thêm token vào header để xác thực
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Có lỗi xảy ra khi thêm danh mục.");
      }

      alert(`Đã thêm danh mục mới: ${categoryName}`);
      navigate("/admin/danhmuc"); // Quay lại trang danh sách sau khi lưu

    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="add-page-container">
      <h1 className="add-page-title">➕ Thêm Danh Mục Mới</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category-name">Tên Danh Mục:</label>
          <input
            type="text"
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            placeholder="Nhập tên danh mục..."
          />
        </div>
        <div className="form-action-buttons">
          <button type="button" onClick={() => navigate("/admin/danhmuc")} className="cancel-button">Hủy Bỏ</button>
          <button type="submit" className="save-button">Lưu Danh Mục</button>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryPage;