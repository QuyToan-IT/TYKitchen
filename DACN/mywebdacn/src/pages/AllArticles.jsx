import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // 1. Import useAuth để lấy token
import "./AllArticles.css";

export default function AllBlogs() {
  const { token } = useAuth(); // 2. Lấy token từ hook
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8888/api/v1/articles", {
        headers: headers,
      });
      if (!res.ok) throw new Error("Không thể tải danh sách bài viết");
      const data = await res.json();

      const mapped = data.map((article) => ({
        id: article.id,
        slug: article.id,
        tag: article.tags?.map((t) => t.name).join(", ") || "KHÁC",
        title: article.title,
        excerpt: article.summary,
        image: article.thumbnailUrl
          ? `http://localhost:8082/uploads/article/${article.thumbnailUrl}`
          : "/image/canhga.png",
      }));

      const filtered = searchTerm.trim()
        ? mapped.filter(
            (post) =>
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mapped;

      setPosts(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(); // Sẽ tự động chạy khi có token
  }, [token]); // 4. Thêm token vào dependency array

  return (
    <main className="blogs-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">GÓC BẾP & BÀI VIẾT</h1>
        <p className="hero-subtitle">
          Nơi chia sẻ mẹo vặt nấu nướng, các câu chuyện ẩm thực thú vị và những công thức được chúng tôi chọn lọc.
        </p>
      </section>

      <div className="page-container">
        {/* Search Section */}
        <section className="search-section">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <div className="search-input-wrapper">
              <img src="/image/kinhlup.png" alt="Tìm kiếm" width={24} height={24} />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm bài viết hoặc công thức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchArticles();
                  }
                }}
              />
            </div>
            <button type="submit" className="search-button" onClick={fetchArticles}>
              Tìm Kiếm
            </button>
          </form>
        </section>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Blog List */}
          <div>
            <h2 className="section-title">TẤT CẢ BÀI VIẾT</h2>

            {loading ? (
              <div className="page-loading">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="page-error">Lỗi: {error}</div>
            ) : posts.length === 0 ? (
              <div className="page-empty">Không tìm thấy bài viết phù hợp.</div>
            ) : (
              <div className="blog-grid">
                {posts.map((post) => (
                  <Link key={post.id} to={`/articles/${post.id}`} className="blog-card">
                    <div className="blog-image">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </div>
                    <div className="blog-content">
                      <div className="blog-tag">{post.tag}</div>
                      <h3 className="blog-title">{post.title}</h3>
                      <p className="blog-excerpt">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <h3 className="sidebar-title">CÔNG THỨC HẤP DẪN</h3>
            <img
              className="sidebar-image"
              src="/image/canhga.png"
              alt="Quảng cáo công thức"
            />
            <p className="sidebar-text">
              Khám phá những công thức nấu ăn độc đáo và hấp dẫn
            </p>
          </aside>
        </div>

        {/* Subscribe Section */}
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
              <button type="submit" className="subscribe-btn">
                Đăng Ký
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
