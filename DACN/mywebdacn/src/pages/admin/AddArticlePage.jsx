import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // hook lấy token
import "./AddArticlePage.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AddArticlePage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tags, setTags] = useState([]);
  const [articleData, setArticleData] = useState({
    title: "",
    content: "",
    summary: "",
    tagIds: [],
    newTags: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Lấy danh sách Tag từ API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("http://localhost:8888/api/v1/tags", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Không thể tải danh sách tag");
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Lỗi khi tải tag:", error);
      }
    };
    if (token) fetchTags();
  }, [token]);

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn file ảnh + preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Xử lý chọn tag có sẵn
  const handleTagSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setArticleData((prev) => ({ ...prev, tagIds: selectedOptions }));
  };

  // Xử lý nhập tag mới
  const handleNewTagsChange = (e) => {
    const newTags = e.target.value.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    setArticleData((prev) => ({ ...prev, newTags }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Vui lòng chọn hình ảnh đại diện");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", articleData.title);
      formData.append("summary", articleData.summary);
      formData.append("content", articleData.content);

      // 👇 thêm userId (tạm hardcode, sau này lấy từ JWT)
      formData.append("userId", 1);

      // Tag có sẵn
      articleData.tagIds.forEach((id) => formData.append("tagIds", id));
      // Tag mới
      articleData.newTags.forEach((tag) => formData.append("newTags", tag));

      const response = await fetch("http://localhost:8888/api/v1/articles", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Có lỗi xảy ra khi thêm bài viết");
      }

      alert("Đã thêm bài viết mới!");
      navigate("/admin/articles");
    } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="article-form-container">
      <h1>➕ Thêm Bài Viết Mới</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Tiêu Đề Bài Viết:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={articleData.title}
            onChange={handleChange}
            required
            placeholder="Nhập tiêu đề chính của bài viết..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Tóm Tắt Ngắn:</label>
          <textarea
            id="summary"
            name="summary"
            rows="3"
            value={articleData.summary}
            onChange={handleChange}
            required
            placeholder="Tóm tắt nội dung chính..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="content">Nội Dung Chi Tiết:</label>
          <CKEditor
            editor={ClassicEditor}
            data={articleData.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setArticleData((prev) => ({ ...prev, content: data }));
            }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="image">Hình Ảnh Đại Diện:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {previewUrl && (
              <div className="image-preview">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tag có sẵn:</label>
            <select
              id="tags"
              name="tagIds"
              multiple
              value={articleData.tagIds}
              onChange={handleTagSelect}
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <small>Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều tag</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="newTags">Tag mới:</label>
          <input
            type="text"
            id="newTags"
            name="newTags"
            placeholder="Nhập tag mới, cách nhau bằng dấu phẩy"
            onChange={handleNewTagsChange}
          />
        </div>

        <div className="action-buttons">
          <button type="button" className="cancel-button" onClick={() => navigate("/admin/articles")}>
            Hủy Bỏ
          </button>
          <button type="submit" className="publish-button">Đăng Bài</button>
        </div>
      </form>
    </div>
  );
};

export default AddArticlePage;
