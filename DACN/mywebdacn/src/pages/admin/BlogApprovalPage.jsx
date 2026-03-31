import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./BlogApprovalPage.css"; // Import file CSS mới

// --- Dữ liệu mẫu ---
const mockBlogsForApproval = [
    {
      id: 3,
      title: "Bí quyết nấu phở bò chuẩn vị Hà Nội",
      author: "Lê Hoàng Cường",
      category: "Mẹo vặt nhà bếp",
      date: "2025-11-14",
      status: "pending",
      summary: "Phở bò là quốc hồn quốc túy của ẩm thực Việt Nam. Bài viết này sẽ chia sẻ bí quyết để có một nồi nước dùng trong, ngọt thanh và đậm đà hương vị truyền thống.",
      imageUrl: "/image/recipes/pho-bo.jpg",
      content: "Để nấu phở bò ngon, khâu quan trọng nhất là nước dùng. Xương bò cần được rửa sạch, chần qua nước sôi để loại bỏ tạp chất trước khi ninh trong nhiều giờ cùng với gừng, hành nướng và các loại gia vị đặc trưng như quế, hồi, thảo quả...",
    },
    // Thêm các bài viết mẫu khác ở đây nếu cần
];

// Hàm giả lập gọi API
const fetchBlogForApprovalById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Tìm bài viết trong mảng dựa trên ID
      const blog = mockBlogsForApproval.find(b => b.id === parseInt(id));
      if (blog) {
        resolve(blog);
      } else {
        reject(new Error("Không tìm thấy bài viết để duyệt."));
      }
    }, 500);
  });
};

// --- Components con ---

const ArticleHeader = ({ blog }) => (
  <div className="article-header">
    <div className="article-meta">
      ID Bài viết: <span>#{blog.id}</span> | Trạng thái: <span className="status-pending-text">{blog.status}</span>
    </div>
    <h1>{blog.title}</h1>
    <div className="article-meta">
      Ngày Đăng: <span>{blog.date}</span> | Tác giả: <span>{blog.author}</span> | Danh mục: <span>{blog.category}</span>
    </div>
  </div>
);

const ContentSection = ({ title, children }) => (
  <div className="content-section">
    <h2>{title}</h2>
    {children}
  </div>
);

// --- Component chính ---

const BlogApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBlog = async () => {
      setIsLoading(true);
      const data = await fetchBlogForApprovalById(id);
      if (isMounted) {
        setBlog(data);
        setIsLoading(false);
      }
    };
    loadBlog();
    return () => { isMounted = false; };
  }, [id]);

  const handleApprove = () => {
    if (window.confirm("Xác nhận duyệt và ĐĂNG bài viết này?")) {
      // Logic gọi API để duyệt bài
      alert(`Đã duyệt bài viết: "${blog.title}"`);
      navigate("/admin/blogs");
    }
  };

  const handleReject = () => {
    if (window.confirm("Xác nhận TỪ CHỐI bài viết này?")) {
      // Logic gọi API để từ chối
      alert(`Đã từ chối bài viết: "${blog.title}"`);
      navigate("/admin/blogs");
    }
  };

  if (isLoading) {
    return <div className="page-loading">Đang tải bài viết...</div>;
  }

  if (!blog) {
    return <div className="page-error">Không tìm thấy bài viết để duyệt.</div>;
  }

  return (
    <div className="approval-page-container">
      <div className="article-header">
        <div className="article-meta">
          ID Bài viết: <span>#{blog.id}</span> | Trạng thái: <span className="status-pending-text">Chờ duyệt</span>
        </div>
        <h1>{blog.title}</h1>
        <div className="article-meta">
          Ngày Đăng: <span>{blog.date}</span> | Tác giả: <span>{blog.author}</span> | Danh mục: <span>{blog.category}</span>
        </div>
      </div>

      <div className="article-content">
        <ContentSection title="Tóm Tắt">
          <p>{blog.summary}</p>
        </ContentSection>

        <ContentSection title="Hình Ảnh Đại Diện">
          <div
            className="featured-image-frame"
            style={{ backgroundImage: `url(${blog.imageUrl})` }}
          >
            {!blog.imageUrl && "Không có hình ảnh"}
          </div>
        </ContentSection>

        <ContentSection title="Nội Dung Chi Tiết">
          <div className="full-content-body">
            {/* Sử dụng pre-wrap để giữ nguyên các xuống dòng từ dữ liệu */}
            <p style={{ whiteSpace: 'pre-wrap' }}>{blog.content}</p>
          </div>
        </ContentSection>
      </div>

      <div className="approval-actions">
        <button type="button" className="btn-reject" onClick={handleReject}>
          ❌ Từ Chối
        </button>
        <Link to={`/admin/blogs/edit/${blog.id}`} className="btn-edit">
          ✏️ Chỉnh Sửa
        </Link>
        <button type="button" className="btn-approve" onClick={handleApprove}>
          ✅ Duyệt & Đăng
        </button>
      </div>
    </div>
  );
};

export default BlogApprovalPage;