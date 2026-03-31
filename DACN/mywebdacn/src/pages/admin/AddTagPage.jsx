import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; 
import "./AddTagPage.css"; // CSS riêng cho trang thêm tag

const AddTagPage = () => {
  const navigate = useNavigate();
  const [tagName, setTagName] = useState("");
  const { token } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tagName.trim() === "") {
      alert("Tên tag không được để trống.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8888/api/v1/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Có lỗi xảy ra khi thêm tag.");
      }

      alert(`Đã thêm tag mới: ${tagName}`);
      navigate("/admin/articles/tags"); // Quay lại trang danh sách tag

    } catch (error) {
      console.error("Lỗi khi thêm tag:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="add-page-container">
      <h1 className="add-page-title">➕ Thêm Tag Mới</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tag-name">Tên Tag:</label>
          <input
            type="text"
            id="tag-name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            placeholder="Nhập tên tag..."
          />
        </div>
        <div className="form-action-buttons">
          <button 
            type="button" 
            onClick={() => navigate("/admin/blogs/tags")} 
            className="cancel-button"
          >
            Hủy Bỏ
          </button>
          <button type="submit" className="save-button">
            Lưu Tag
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTagPage;
