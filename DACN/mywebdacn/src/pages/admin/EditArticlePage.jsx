import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./ArticleDetailsPage.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const fetchArticleById = async (id, token) => {
  const response = await fetch(`/api/v1/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Không thể tải dữ liệu bài viết");
  return response.json();
};

const fetchTags = async (token) => {
  const res = await fetch(`/api/v1/tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách tags");
  return res.json();
};

// ✅ gửi FormData thay vì JSON
const updateArticleById = async (id, token, updatedData, imageFile) => {
  const formData = new FormData();
  formData.append("title", updatedData.title);
  formData.append("summary", updatedData.summary);
  formData.append("content", updatedData.content);
  formData.append("userId", updatedData.userId);

  if (updatedData.tagIds) {
    updatedData.tagIds.forEach((tagId) => formData.append("tagIds", tagId));
  }
  if (updatedData.newTags) {
    updatedData.newTags.forEach((tag) => formData.append("newTags", tag));
  }

  if (imageFile) {
    formData.append("image", imageFile); // ✅ key phải trùng với @RequestParam("image")
  }

  const response = await fetch(`/api/v1/articles/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }, // ❌ KHÔNG set Content-Type
    body: formData,
  });
  if (!response.ok) throw new Error("Cập nhật bài viết thất bại");
  return response.json();
};

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleData, tagsData] = await Promise.all([
          fetchArticleById(id, token),
          fetchTags(token),
        ]);
        setArticle({
          ...articleData,
          tagIds: articleData.tags?.map((t) => t.id) || [],
          newTags: [],
        });
        setAllTags(tagsData);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadData();
  }, [id, token]);

  const handleChange = (field, value) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dto = {
        title: article.title,
        summary: article.summary,
        content: article.content,
        userId: article.userId,
        tagIds: article.tagIds,
        newTags: article.newTags,
      };

      await updateArticleById(id, token, dto, newImage);
      alert("Đã cập nhật bài viết!");
      navigate(`/admin/articles/details/${id}`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tagId) => {
    setArticle((prev) => {
      const exists = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: exists
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      };
    });
  };

  const addNewTag = () => {
    if (newTagName.trim() !== "") {
      setArticle((prev) => ({
        ...prev,
        newTags: [...prev.newTags, newTagName.trim()],
      }));
      setNewTagName("");
    }
  };

  if (error) return <div className="page-error">Lỗi: {error}</div>;
  if (!article) return <div className="page-loading">Đang tải dữ liệu bài viết...</div>;

  return (
    <div className="details-page-wrapper">
      <h1 className="details-main-title">CHỈNH SỬA BÀI VIẾT</h1>

      <div className="detail-container">
        <DetailSection title="Ảnh đại diện">
          <div className="dish-image-container">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : `http://localhost:8082/uploads/article/${article.thumbnailUrl}`
              }
              alt="Ảnh bài viết"
            />
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </DetailSection>

        <DetailSection title="Tiêu đề">
          <InfoField
            label="Tiêu đề"
            value={article.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </DetailSection>

        <DetailSection title="Tóm tắt">
          <ContentBox
            content={article.summary}
            onChange={(e) => handleChange("summary", e.target.value)}
          />
        </DetailSection>

        <DetailSection title="Nội dung">
          <CKEditor
            editor={ClassicEditor}
            data={article.content || ""}
            onChange={(event, editor) => {
              const data = editor.getData();
              handleChange("content", data);
            }}
          />
        </DetailSection>

        <DetailSection title="Tags">
          <div className="tag-list">
            {allTags.map((tag) => (
              <label key={tag.id} className="tag-item">
                <input
                  type="checkbox"
                  checked={article.tagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
          <div className="new-tag-row">
            <input
              type="text"
              placeholder="Thêm tag mới..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <button onClick={addNewTag} className="action-button">Thêm</button>
          </div>
          <div className="new-tag-list">
            {article.newTags.map((t, idx) => (
              <span key={idx} className="tag-item">{t}</span>
            ))}
          </div>
        </DetailSection>

        <div className="footer-actions">
          <button
            onClick={handleSave}
            className="action-button edit-btn"
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Các component phụ
const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value, onChange }) => (
  <div className="info-field">
    <label className="info-label">{label}:</label>
    <div className="value-box">
      <input type="text" value={value} onChange={onChange} />
    </div>
  </div>
);

const ContentBox = ({ content, onChange }) => (
  <textarea
    className="content-box"
    value={content}
    onChange={onChange}
  ></textarea>
);

export default EditArticlePage;
