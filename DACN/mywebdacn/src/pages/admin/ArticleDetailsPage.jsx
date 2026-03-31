import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./ArticleDetailsPage.css";

const fetchArticleById = async (id, token) => {
  const response = await fetch(`/api/v1/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Lỗi ${response.status}: Không tìm thấy bài viết`);
  }

  return response.json();
};

const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label className="info-label">{label}:</label>
    <div className="value-box">
      <input type="text" value={value} readOnly />
    </div>
  </div>
);

const ContentBox = ({ content }) => (
  <textarea className="content-box" readOnly value={content}></textarea>
);

const TagList = ({ tags }) => (
  <div className="tag-list">
    {tags.length > 0 ? (
      tags.map((tag) => (
        <span key={tag.id} className="tag-item">{tag.name}</span>
      ))
    ) : (
      <p>Không có thẻ nào.</p>
    )}
  </div>
);

const ArticleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadArticleDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchArticleById(id, token);
        if (isMounted) setArticle(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (token) loadArticleDetails();

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa bài viết "${article.title}"?`)) {
      try {
        const res = await fetch(`/api/v1/articles/${article.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Xóa bài viết thất bại");
        alert("Đã xóa bài viết!");
        navigate("/admin/articles");
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  if (isLoading) return <div className="page-loading">Đang tải chi tiết bài viết...</div>;
  if (error) return (
    <div className="page-error">
      <p>Lỗi: {error}</p>
      <button onClick={() => navigate("/admin/articles")} className="action-btn">Quay lại</button>
    </div>
  );
  if (!article) return <div className="page-error">Không tìm thấy bài viết.</div>;

  return (
    <div className="details-page-wrapper">
      <h1 className="details-main-title">CHI TIẾT BÀI VIẾT</h1>

      <div className="dish-image-container">
        <img src={`http://localhost:8888/uploads/article/${article.thumbnailUrl}`} alt={article.title} />
      </div>

      <div className="detail-container">
        <InfoField label="Tiêu đề" value={article.title} />
        <InfoField label="Ngày đăng" value={new Date(article.createdAt).toLocaleDateString("vi-VN")} />

        <DetailSection title="Tóm tắt">
          <ContentBox content={article.summary || "Không có tóm tắt."} />
        </DetailSection>

        <DetailSection title="Nội dung bài viết">
          <ContentBox content={article.content || "Không có nội dung."} />
        </DetailSection>

        <DetailSection title="Thẻ gắn (Tags)">
          <TagList tags={article.tags || []} />
        </DetailSection>

        <div className="footer-actions">
          <Link to={`/admin/articles/edit/${article.id}`} className="action-btn edit-btn">
            Chỉnh Sửa
          </Link>
          <button onClick={handleDelete} className="action-button delete-btn">
            Xóa Bài Viết
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailsPage;
