import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./RecipeDetail.css";
import { jwtDecode } from "jwt-decode";

export default function RecipeDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sameCategory, setSameCategory] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0); 

  // State hiển thị số lượng món liên quan
  const [visibleRelatedCount] = useState(4);

  // Rating state
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentImages, setCommentImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");


  // 1. Fetch recipe + related recipes (PUBLIC - Ai cũng xem được)
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // ✅ Header có điều kiện: Có token thì gửi, không thì thôi
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`http://localhost:8888/api/v1/recipes/${id}`, {
          headers: headers,
        });

        if (!response.ok) throw new Error("Không thể tải công thức");
        const data = await response.json();
        setRecipe(data);

        // ✅ Lấy các món cùng category (Cũng dùng header có điều kiện)
        if (data.categoryId) {
          const resCat = await fetch(
            `http://localhost:8888/api/v1/recipes?category=${data.categoryId}`,
            { headers: headers }
          );
          if (resCat.ok) {
            const list = await resCat.json();
            setSameCategory(list.filter((r) => r.id !== data.id));
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy công thức:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // ✅ Bỏ điều kiện if (token), luôn gọi hàm này
    fetchRecipe();
  }, [id, token]);
  useEffect(() => {
  if (recipe?.userId) {
    fetch(`http://localhost:8888/api/v1/users/${recipe.userId}`)
      .then(res => res.json())
      .then(data => setAuthor(data))
      .catch(err => console.error("Lỗi khi lấy thông tin tác giả:", err));
  }
}, [recipe?.userId]);


  // 2. Fetch stats (PUBLIC) + user-rating (PRIVATE)
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // a. Lấy Thống kê chung (Ai cũng xem được)
        // Lưu ý: Backend API /ratings/stats phải được mở public (permitAll)
        const statsRes = await fetch(
          `http://localhost:8888/api/v1/ratings/stats?entityType=RECIPE&entityId=${id}`
        );
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setAverageRating(Number(stats.averageRating) || 0);
          setRatingCount(Number(stats.ratingCount) || 0);
        }

        // b. Lấy điểm User đã đánh giá (Chỉ khi đã đăng nhập)
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded?.userId;

          const userRes = await fetch(
            `http://localhost:8888/api/v1/ratings/user-rating?entityType=RECIPE&entityId=${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "x-user-id": userId,
              },
            }
          );
          if (userRes.ok) {
            const userRatingData = await userRes.json();
            setUserRating(Number(userRatingData.stars));
          }
        } else {
            // Nếu không đăng nhập, reset userRating về 0
            setUserRating(0);
        }
      } catch (err) {
        console.error("Lỗi khi fetch ratings:", err);
      }
    };

    fetchRatings();
  }, [id, token]);

  // 3. Fetch comments (PUBLIC) và Current User (PRIVATE)
  useEffect(() => {
    // a. Lấy danh sách bình luận (Public)
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/v1/comments?entityType=RECIPE&entityId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy bình luận:", err);
      }
    };

    // b. Lấy thông tin user hiện tại (Private - chỉ khi có token)
    const fetchCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const res = await fetch("http://localhost:8888/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };

    fetchComments();
    fetchCurrentUser();
  }, [id, token]);

  if (loading) return <p className="loading-text">Đang tải...</p>;
  if (error) return <p className="error-text">Lỗi: {error}</p>;
  if (!recipe) return <p className="error-text">Không tìm thấy công thức</p>;

  const handleSave = () => {
      if (!token) return alert("Vui lòng đăng nhập để lưu công thức!");
      alert("Đã lưu công thức!");
  };
  
  const handlePrint = () => window.print();
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: "Xem công thức này",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã copy link!");
    }
  };

  const handleRating = async (value) => {
    if (!token) {
      alert("Bạn cần đăng nhập để đánh giá!");
      // Có thể navigate('/login') ở đây nếu muốn
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded?.userId;

      const res = await fetch("http://localhost:8888/api/v1/ratings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityId: id,
          entityType: "RECIPE",
          stars: value,
        }),
      });

      if (!res.ok) {
        console.error("Lỗi khi gửi rating");
        return;
      }

      setUserRating(value);

      // Reload stats sau khi đánh giá
      const statsRes = await fetch(
        `http://localhost:8888/api/v1/ratings/stats?entityType=RECIPE&entityId=${id}`
      );
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAverageRating(stats.averageRating);
        setRatingCount(stats.ratingCount);
      }
    } catch (err) {
      console.error("Exception khi gửi rating:", err);
    }
  };

  const handleCommentSubmit = async () => {
  if (!token || !currentUser) {
    alert("Bạn cần đăng nhập để bình luận!");
    return;
  }
  if (!newComment.trim()) {
    alert("Vui lòng nhập nội dung bình luận.");
    return;
  }

  try {
    // FormData để gửi cả text + ảnh
    const formData = new FormData();
    formData.append("comment", new Blob([JSON.stringify({
      entityId: id,
      entityType: "RECIPE",
      content: newComment,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      userAvatarUrl: currentUser.avatarUrl,
    })], { type: "application/json" }));

    // thêm ảnh
    commentImages.forEach((file) => {
      formData.append("images", file);
    });

    const res = await fetch("http://localhost:8888/api/v1/comments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Gửi bình luận thất bại");

    const createdComment = await res.json();
    setComments([createdComment, ...comments]);
    setNewComment("");
    setCommentImages([]); // reset ảnh
  } catch (err) {
    console.error("Lỗi khi gửi bình luận:", err);
    alert("Đã có lỗi xảy ra, không thể gửi bình luận.");
  }
};

const handleReplySubmit = async (parentId) => {
  if (!token || !currentUser) {
    alert("Bạn cần đăng nhập để trả lời!");
    return;
  }
  if (!replyContent.trim()) {
    alert("Vui lòng nhập nội dung trả lời.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("comment", new Blob([JSON.stringify({
      entityId: id,
      entityType: "RECIPE",
      content: replyContent,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      userAvatarUrl: currentUser.avatarUrl,
    })], { type: "application/json" }));

    const res = await fetch(`http://localhost:8888/api/v1/comments/${parentId}/reply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Gửi trả lời thất bại");

    const createdReply = await res.json();
    // Cập nhật lại comments để hiển thị reply mới
    setComments(comments.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...(comment.replies || []), createdReply] } 
        : comment
    ));
    setReplyContent("");
    setReplyingCommentId(null); // Đóng form reply
  } catch (err) {
    console.error("Lỗi khi gửi trả lời:", err);
    alert("Đã có lỗi xảy ra, không thể gửi trả lời.");
  }
}
// Hàm xử lý avatar
const getAvatarSrc = (url) => {
  if (!url) return "/image/user.png";

  if (url.includes("googleusercontent.com")) {
    return url.replace(/=s\d+(-c)?/g, "=s400-c");
  }

  if (url.includes("graph.facebook.com")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=400&height=400`;
  }

  if (url.startsWith("http")) return url;

  return `http://localhost:8888${url}`;
};

return (
    <main className="recipe-detail-page">
      <div className="detail-container">
<header className="recipe-header">
  <h1 className="recipe-title">{recipe.title}</h1>

  <div className="recipe-meta-center">
    {author && (
      <div
        className="meta-creator-link"
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!token) {
            navigate(`/users/${author.id}`);
            return;
          }
          try {
            const decoded = jwtDecode(token);
            const currentUserId = decoded.userId;
            if (currentUserId === author.id) {
              navigate("/Profile"); // hồ sơ cá nhân của tôi
            } else {
              navigate(`/users/${author.id}`); // hồ sơ người khác
            }
          } catch (err) {
            console.error("Lỗi decode token:", err);
            navigate(`/users/${author.id}`);
          }
        }}
      >
        <img
          src={getAvatarSrc(author.avatarUrl)}
          alt={author.fullName || recipe.creatorName || "Tác giả"}
          className="meta-creator-avatar"
          onError={(e) => { e.target.src = "/image/user.png"; }}
        />
        <span className="meta-creator-name">
          {author.fullName || recipe.creatorName || "Tác giả"}
        </span>
      </div>
    )}

    <div className="meta-inline-info">
      <span><strong>Nấu:</strong> {recipe.cookTime}</span>
      <span><strong>Danh mục:</strong> {recipe.categoryName}</span>
    </div>

    <div className="meta-creator-buttons">
      <button
        className="meta-creator-btn chat-btn"
        onClick={() => {
          if (!token) {
            alert("Vui lòng đăng nhập để nhắn tin!");
            navigate("/login");
            return;
          }
          alert("Tính năng chat đang được phát triển!");
        }}
      >
        💬 Chat Ngay
      </button>

      {author && (
        <button
          className="meta-creator-btn view-btn"
          onClick={() => navigate(`/users/${author.id}`)}
        >
          👁️ Xem Bếp
        </button>
      )}
    </div>
  </div>
</header>



        {/* Main Content */}
        <section className="main-content">
          <div className="image-section">
            <img
              src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
              alt={recipe.title}
              className="recipe-image"
              onError={(e) => { e.target.src = "/image/default-food.png" }}
            />
            <div className="action-buttons">
              <button className="action-btn" onClick={handleSave}>
                <img src="/image/traitim.png" alt="" /> Lưu
              </button>
              <button className="action-btn" onClick={handlePrint}>
                <img src="/image/in.png" alt="" /> In
              </button>
              <button className="action-btn" onClick={handleShare}>
                <img src="/image/share.png" alt="" /> Chia sẻ
              </button>
            </div>
          </div>

          {/* Dinh dưỡng */}
          {recipe.nutritions?.length > 0 && (
            <div className="nutrition-card">
              <h2 className="nutrition-title">Thông Tin Dinh Dưỡng</h2>
              <ul className="nutrition-list">
                {recipe.nutritions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Description */}
        {recipe.description && (
          <section className="content-section">
            <p className="description-text">{recipe.description}</p>
          </section>
        )}

        {/* Ingredients */}
        <section className="content-section">
          <h2 className="section-title">Nguyên Liệu</h2>
          <div className="ingredient-group">
            <h3 className="ingredient-group-title">Nguyên liệu chính</h3>
            <ul className="ingredient-list">
              {recipe.ingredients?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          {recipe.spices?.length > 0 && (
            <div className="ingredient-group">
                <h3 className="ingredient-group-title">Gia vị</h3>
                <ul className="ingredient-list">
                {recipe.spices.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
                </ul>
            </div>
          )}
        </section>

        {/* Steps */}
         <section className="content-section">
      <h2 className="section-title">Các Bước Thực Hiện</h2>

      <div className="step-buttons">
        {recipe.steps?.map((_, idx) => (
          <button
            key={idx}
            className={activeStep === idx ? "active" : ""}
            onClick={() => setActiveStep(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="step-content">
        {activeStep !== null && (
          <div style={{ color: "black" }} dangerouslySetInnerHTML={{ __html: recipe.steps[activeStep] }} />
        )}
      </div>
    </section>

        {/* Rating */}
        <section className="content-section">
          <h2 className="section-title">Đánh Giá Công Thức</h2>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRating(star)}
                style={{
                  cursor: "pointer",
                  color: userRating >= star ? "gold" : "gray",
                  fontSize: "24px",
                  marginRight: "5px"
                }}
              >
                ★
              </span>
            ))}
          </div>
          <p>
            {Number(ratingCount) > 0
              ? `Điểm trung bình: ${Number(averageRating).toFixed(1)} (${ratingCount} lượt đánh giá)`
              : "Chưa có đánh giá nào"}
          </p>
        </section>

        {/* Comments Section */}

<section className="content-section">
  <h2 className="section-title">Bình Luận ({comments.length})</h2>

  <div className="comment-list">
    {comments.map((comment) => (
      <div key={comment.id} className="comment-item">
        {/* Avatar */}
        <img
          src={
            comment.userAvatarUrl
              ? (comment.userAvatarUrl.startsWith("http")
                  ? comment.userAvatarUrl
                  : `http://localhost:8888${comment.userAvatarUrl}`)
              : "/image/user.png"
          }
          alt={comment.userFullName}
          className="comment-avatar"
          onError={(e) => {
            e.target.src = "/image/user.png";
          }}
        />

        {/* Nội dung comment */}
        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{comment.userFullName}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          <p className="comment-text">{comment.content}</p>

          {/* Ảnh kèm bình luận */}
          {comment.images?.length > 0 && (
            <div className="comment-images">
              {comment.images.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:8888${img.imageUrl}`}
                  alt={`comment-img-${i}`}
                  className="comment-image"
                />
              ))}
            </div>
          )}

          {/* Nút Trả lời */}
          {token && (
            <button
              className="reply-btn"
              onClick={() => setReplyingCommentId(comment.id)}
            >
              Trả lời
            </button>
          )}

          {/* Form nhập reply */}
          {replyingCommentId === comment.id && (
            <div className="reply-form">
              <textarea
                className="reply-textarea"
                placeholder="Nhập trả lời của bạn..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                className="reply-submit-btn"
                onClick={() => handleReplySubmit(comment.id)}
              >
                Gửi Trả Lời
              </button>
            </div>
          )}

          {/* ✅ Hiển thị replies ngay dưới comment cha */}
          {comment.replies?.length > 0 && (
            <div className="comment-replies">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="reply-item">
                  <div className="reply-header">
                    <span className="reply-author">{reply.userFullName}</span>
                    <span className="reply-date">
                      {new Date(reply.createdAt).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="reply-text">{reply.content}</p>

                  {/* Ảnh kèm reply */}
                  {reply.images?.length > 0 && (
                    <div className="reply-images">
                      {reply.images.map((img, i) => (
                        <img
                          key={i}
                          src={`http://localhost:8888${img.imageUrl}`}
                          alt={`reply-img-${i}`}
                          className="reply-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Form nhập bình luận mới */}
  {token ? (
    <div className="comment-form">
      <textarea
        className="comment-textarea"
        placeholder="Nhập bình luận của bạn..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setCommentImages(Array.from(e.target.files))}
        className="comment-file-input"
      />

      {commentImages.length > 0 && (
        <div className="comment-preview-images">
          {commentImages.map((file, i) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              alt={`preview-${i}`}
              className="comment-preview-img"
            />
          ))}
        </div>
      )}

      <button className="comment-btn" onClick={handleCommentSubmit}>
        Gửi Bình Luận
      </button>
    </div>
  ) : (
    <p className="login-prompt">
      Vui lòng{" "}
      <Link to="/login" style={{ color: "#0EA5E9", fontWeight: "bold" }}>
        đăng nhập
      </Link>{" "}
      để bình luận và đánh giá.
    </p>
  )}
</section>


        {/* Related Recipes */}
        {sameCategory.length > 0 && (
          <section>
            <h2 className="section-title">Các Công Thức Khác</h2>
            <div className="related-grid">
              {sameCategory.slice(0, visibleRelatedCount).map((item) => (
                <Link key={item.id} to={`/recipes/${item.id}`} className="recipe-card">
                  <div className="recipe-img-wrapper">
                    <img
                      className="recipe-img"
                      src={`http://localhost:8888/uploads/recipe/${item.mainImageUrl}`}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => { e.target.src = "/image/default-food.png" }}
                    />
                  </div>
                  <div className="recipe-body">
                    <h3 className="recipe-title">{item.title}</h3>
                    <div className="recipe-card-meta">
                      <img src="/image/time.png" alt="Thời gian" width={16} height={16} />
                      <span>{item.cookTime}</span>
                    </div>
                    <div className="recipe-card-meta">
                      <img src="/image/user.png" alt="Người đăng" width={16} height={16} />
                      <span>{item.creatorName || "Bếp Của Ty"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {sameCategory.length > visibleRelatedCount && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link
                  to={`/recipes?category=${recipe.categoryId}`}
                  className="comment-btn"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Hiển thị tất cả
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}