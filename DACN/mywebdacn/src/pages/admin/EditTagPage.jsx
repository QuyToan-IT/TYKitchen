import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./EditTagPage.css"; // Dùng lại CSS của danh mục

const EditTagPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tagName, setTagName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTag = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8888/api/v1/tags/${id}`);
      if (!response.ok) {
        throw new Error("Không tìm thấy tag hoặc có lỗi xảy ra.");
      }
      const data = await response.json();
      setTagName(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTag();
  }, [fetchTag]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tagName.trim() === "") {
      alert("Tên tag không được để trống.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8888/api/v1/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Có lỗi xảy ra khi cập nhật tag.");
      }

      alert("Đã cập nhật thành công tag!");
      navigate("/admin/articles/tags");

    } catch (error) {
      console.error("Lỗi khi cập nhật tag:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="edit-page-container">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="edit-page-container error-message">
        <p>Lỗi: {error}</p>
        <button onClick={() => navigate("/admin/articles/tags")} className="cancel-button">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="edit-page-container">
      <h1 className="edit-page-title">📝 Chỉnh Sửa Tag</h1>
      <p className="category-id-display">ID Tag: #{id}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tag-name">Tên Tag:</label>
          <input
            type="text"
            id="tag-name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            placeholder="Nhập tên tag mới..."
          />
        </div>

        <div className="form-action-buttons">
          <button type="button" onClick={() => navigate("/admin/articles/tags")} className="cancel-button">Hủy Bỏ</button>
          <button type="submit" className="save-button">Lưu Thay Đổi</button>
        </div>
      </form>
    </div>
  );
};

export default EditTagPage;
