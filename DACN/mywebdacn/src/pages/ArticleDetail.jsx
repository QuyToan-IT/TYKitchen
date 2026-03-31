import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./ArticleDetail.css";

export default function ArticleDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [error, setError] = useState(null);
  console.log("Token hiện tại:", token);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`http://localhost:8888/api/v1/articles/${id}`, {
          headers: headers,
        });
        if (!res.ok) throw new Error("Không thể tải bài viết");
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchRelatedArticles = async () => {
      try {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("http://localhost:8888/api/v1/articles", {
          headers: headers,
        });
        const data = await res.json();
        const filtered = data.filter((a) => a.id !== Number(id)).slice(0, 3);
        setRelatedArticles(filtered);
      } catch (err) {
        console.error("Lỗi khi tải bài viết liên quan:", err);
      }
    };

    fetchArticleDetail();
    fetchRelatedArticles();
  }, [id, token]);

  if (error) return <div className="page-error">Lỗi: {error}</div>;
  if (!article) return <div className="page-loading">Đang tải dữ liệu...</div>;

  return (
    <main className="article-detail-page">
      <div className="article-container">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            Ngày đăng: {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ""}
          </div>
        </header>

        {article.thumbnailUrl && (
          <img
            src={`http://localhost:8888/uploads/article/${article.thumbnailUrl}`}
            alt={article.title}
            className="featured-image"
          />
        )}

        <article className="article-content">
          {article.content &&
            article.content
              .split(/\r?\n/)
              .filter((line) => line.trim() !== "")
              .map((para, idx) => <p key={idx}>{para}</p>)}
        </article>

        {article.tags?.length > 0 && (
          <div className="article-tags">
            {article.tags.map((tag) => (
              <span key={tag.id} className="tag">#{tag.name}</span>
            ))}
          </div>
        )}

        <section className="related-section">
          <h2 className="section-title">Các Bài Viết Khác</h2>
          <div className="related-grid">
            {relatedArticles.map((item) => (
              <Link key={item.id} to={`/articles/${item.id}`} className="related-card">
                <div className="related-image">
                  {item.thumbnailUrl && (
                    <img
  src={`http://localhost:8888/uploads/article/${item.thumbnailUrl}`}
  alt={item.title}
  loading="lazy"
/>

                  )}
                </div>
                <div className="related-content">
                  <h3 className="related-title">{item.title}</h3>
                  <div className="related-meta">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""} | {item.userId}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="subscribe-section">
        <div className="subscribe-content">
          <h2 className="subscribe-title">Món Ngon Đến Hộp Thư Của Bạn</h2>
          <p className="subscribe-subtitle">
            Đăng ký ngay để không bỏ lỡ những công thức nấu ăn mới, mẹo vặt nhà bếp và ưu đãi đặc biệt từ "Bếp của Ty".
          </p>
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <div className="subscribe-input-wrapper">
              <input type="email" placeholder="Địa chỉ email của bạn..." />
            </div>
            <button type="submit" className="subscribe-btn">Đăng Ký</button>
          </form>
        </div>
      </section>
    </main>
  );
}
