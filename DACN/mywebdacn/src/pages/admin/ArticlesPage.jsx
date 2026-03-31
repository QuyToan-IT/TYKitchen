import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./ArticlesPage.css";

const ArticleRow = ({ article, token, onArticleDeleted }) => {
  // Hàm cắt ngắn tiêu đề nếu quá dài
  const truncateTitle = (title, maxLength = 80) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa bài viết "${article.title}"?`)) {
      try {
        const res = await fetch(`http://localhost:8888/api/v1/articles/${article.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Xóa bài viết thất bại");
        }
        alert(`Đã xóa bài viết: ${article.title}`);
        onArticleDeleted(article.id);
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <div className="data-table-grid table-row">
      <div className="cell-image-wrapper">
        <img
          src={`http://localhost:8888/uploads/article/${article.thumbnailUrl}`}
          alt={article.title}
          className="article-image"
        />
      </div>
      <span className="cell-text article-title" title={article.title}>
        {truncateTitle(article.title)}
      </span>
      <span className="cell-text">{new Date(article.createdAt).toLocaleDateString("vi-VN")}</span>
      <div className="cell-actions">
        <Link to={`/admin/articles/details/${article.id}`} className="action-btn">
          Chi Tiết
        </Link>
        <button onClick={handleDelete} className="action-btn btn-delete">
          Xóa
        </button>
      </div>
    </div>
  );
};

const Pagination = () => (
  <div className="pagination">
    <span className="page-arrow">&lsaquo;</span>
    <div className="page-number active">1</div>
    <div className="page-number">2</div>
    <div className="page-number">3</div>
    <span className="page-ellipsis">...</span>
    <div className="page-number">10</div>
    <span className="page-arrow">&rsaquo;</span>
  </div>
);

const ArticlesPage = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8888/api/v1/articles", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể tải danh sách bài viết.");
        }

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error("Lỗi khi tải articles:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchArticles();
  }, [token]);

  const handleArticleDeleted = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  if (error) return <div className="articles-page-container error-message">Lỗi: {error}</div>;

  return (
    <div className="articles-page-container">
      <h1 className="page-title">QUẢN LÝ BÀI VIẾT</h1>

      <div className="top-controls">
        <div className="search-box">
          <img src="/image/kinhlup.png" alt="Tìm kiếm" className="search-icon" />
          <input type="text" placeholder="Tìm kiếm bài viết..." />
        </div>
        <Link to="/admin/articles/add" className="add-button">+</Link>
      </div>

      <div className="data-table-container">
        <div className="data-table-grid table-header">
          <span>ẢNH</span>
          <span>TIÊU ĐỀ</span>
          <span>NGÀY ĐĂNG</span>
          <span style={{ textAlign: "center" }}>CHỨC NĂNG</span>
        </div>

        {loading ? (
          <div className="loading-message">Đang tải bài viết...</div>
        ) : articles.length === 0 ? (
          <div className="loading-message">Chưa có bài viết nào.</div>
        ) : (
          articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              token={token}
              onArticleDeleted={handleArticleDeleted}
            />
          ))
        )}
      </div>

      <Pagination />
    </div>
  );
};

export default ArticlesPage;
