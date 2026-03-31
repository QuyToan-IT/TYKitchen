import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import './UserProfile.css';
import ChatPage from "./ChatPage";

export default function UserProfile() {

    const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }
            if (startPage > 1) pages.push(1);
            if (startPage > 2) pages.push("...");
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages - 1) pages.push("...");
            if (endPage < totalPages) pages.push(totalPages);
            return pages;
        };

        const pageNumbers = getPageNumbers();

        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 30 }}>
                <span
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, color: "#000", cursor: currentPage > 1 ? "pointer" : "not-allowed",
                        fontSize: 20, fontWeight: 700, borderRadius: 6, border: "2px solid #3B82F6",
                        background: "white", transition: "all 0.2s ease", opacity: currentPage > 1 ? 1 : 0.5,
                    }}
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                >
                    &lsaquo;
                </span>
                {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                        <span key={idx} style={{ fontSize: 12, color: "#666" }}>...</span>
                    ) : (
                        <div
                            key={idx}
                            style={{
                                width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center",
                                justifyContent: "center", fontWeight: 700, fontSize: 14,
                                border: currentPage === page ? "2px solid #3B82F6" : "2px solid #ddd",
                                color: currentPage === page ? "white" : "#000",
                                background: currentPage === page ? "#3B82F6" : "white",
                                cursor: "pointer", transition: "all 0.2s ease",
                            }}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </div>
                    )
                )}
                <span
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, color: "#000", cursor: currentPage < totalPages ? "pointer" : "not-allowed",
                        fontSize: 20, fontWeight: 700, borderRadius: 6, border: "2px solid #3B82F6",
                        background: "white", transition: "all 0.2s ease", opacity: currentPage < totalPages ? 1 : 0.5,
                    }}
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                >
                    &rsaquo;
                </span>
            </div>
        );
    };

    const { userId } = useParams();
    const navigate = useNavigate();
    const [recipesPage, setRecipesPage] = useState(1);
    const recipesPerPage = 9;
    const [profile, setProfile] = useState(null);
    const [userRecipes, setUserRecipes] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const { token } = useAuth();
    

    const getAvatarSrc = (url) => {
        if (!url) return "/image/user.png";
        if (url.includes('googleusercontent.com')) return url.replace(/=s\d+(-c)?/g, '=s400-c');
        if (url.includes('graph.facebook.com')) {
             const separator = url.includes('?') ? '&' : '?';
             return `${url}${separator}width=400&height=400`;
        }
        if (url.startsWith("http") || url.startsWith("https")) return url;
        return `http://localhost:8888${url}`;
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`http://localhost:8888/api/v1/users/${userId}`, {
                    headers,
                });
                if (!res.ok) throw new Error(`Không thể lấy hồ sơ: ${res.statusText}`);
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error("Lỗi khi lấy profile:", err);
            }
        };
        fetchUserProfile();
    }, [userId, token]);

        useEffect(() => {
        const fetchUserRecipes = async () => {
            try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`http://localhost:8888/api/v1/recipes`, { headers });
            if (!res.ok) throw new Error("Không thể lấy món ăn");

            const data = await res.json();
            console.log("Ví dụ một recipe:", data[0]); // kiểm tra field

            // Lọc món ăn đã duyệt và đúng userId
            const approvedRecipes = data.filter(
                recipe => recipe.status === 'APPROVED' && String(recipe.userId) === String(userId)
            );

            setUserRecipes(approvedRecipes);
            } catch (err) {
            console.error("Lỗi khi lấy recipes:", err);
            }
        };

        if (userId) {
            fetchUserRecipes();
        }
        }, [userId, token]);


const handleFollow = async () => {
  if (!token) {
    alert("Vui lòng đăng nhập để theo dõi!");
    navigate("/login");
    return;
  }

  try {
    const decoded = jwtDecode(token);
    const currentUserId = decoded.userId;

    if (userId === currentUserId) {
      alert("Bạn không thể tự theo dõi chính mình!");
      return;
    }

   const res = await fetch(`http://localhost:8888/api/v1/users/${userId}/follow`, {
  method: isFollowing ? "DELETE" : "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

console.log("👉 Status:", res.status);
console.log("👉 Headers:", [...res.headers.entries()]); // log toàn bộ header
const text = await res.text();
console.log("👉 Body:", text);

    if (res.ok) {
      setIsFollowing(!isFollowing);
      alert(isFollowing ? "Đã bỏ theo dõi!" : "Đã theo dõi!");
    } else {
      alert(`Có lỗi xảy ra (${res.status}): ${text || "Server từ chối request"}`);
    }
  } catch (err) {
    console.error("❌ Lỗi khi theo dõi:", err);
    alert("Có lỗi xảy ra, vui lòng thử lại!");
  }
};

const recipesIndexOfLast = recipesPage * recipesPerPage;
const recipesIndexOfFirst = recipesIndexOfLast - recipesPerPage;
const paginatedRecipes = userRecipes.slice(recipesIndexOfFirst, recipesIndexOfLast);

const [showChat, setShowChat] = useState(false);

// Lấy id người dùng hiện tại từ localStorage
let currentUserId = null;
if (token) {
    try {
        const decoded = jwtDecode(token);
        currentUserId = decoded.userId;
    } catch (e) {
        console.error("Lỗi giải mã token:", e);
    }
}

if (!profile) return <p>Đang tải hồ sơ...</p>;

return (
  <main className="profile-page">
    <div className="profile-container">
      <section className="profile-header">
        {/* Avatar */}
        <div className="avatar-wrapper">
          {profile.avatarUrl && (
            <img
              src={getAvatarSrc(profile.avatarUrl)}
              alt="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/image/user.png";
              }}
            />
          )}
        </div>

        {/* Thông tin hồ sơ */}
        <div className="profile-info">
          <div className="profile-title-row">
            <h1 className="profile-name">{profile.fullName}</h1>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <strong>{userRecipes.length}</strong> món ăn
            </div>
            <div className="stat-item">
              <strong>{profile.followers || 0}</strong> người quan tâm
            </div>
          </div>

          {profile.description && (
            <p className="profile-description">{profile.description}</p>
          )}

          {/* Các nút hành động */}
          <div className="action-buttons">
            <button
              className={`action-btn ${isFollowing ? "following-btn" : "follow-btn"}`}
              onClick={handleFollow}
            >
              {isFollowing ? "✓ Đang theo dõi" : "+ Theo dõi"}
            </button>

            <button
              className="action-btn chat-btn"
              onClick={() => setShowChat(true)}
            >
              💬 Chat ngay
            </button>
          </div>
        </div>

        {/* Khung chat nổi bên phải */}
        {showChat && (
          <div className="floating-chat">
            <ChatPage
              token={token}
              currentUserId={currentUserId}   // người gửi (user đăng nhập)
              userId={profile.id}             // người nhận (chủ profile)
              navigate={navigate}
            />
            <button
              className="close-chat"
              onClick={() => setShowChat(false)}
            >
              ✖
            </button>
          </div>
        )}
      </section>

<section className="tabs">
  <div className="tab active">
    Món ăn ({userRecipes.length})
  </div>
</section>

{userRecipes.length > 0 ? (
  <>
    <section className="recipe-grid">
      {paginatedRecipes.map((recipe) => (
        <Link
          key={recipe.id}
          to={`/recipes/${recipe.id}`}
          className="recipe-card"
        >
          <div className="recipe-card-image">
            <img
              src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
              alt={recipe.title}
              onError={(e) => { e.target.src = "/image/recipe-placeholder.png"; }}
            />
          </div>
          <div className="recipe-card-body">
            <h3 className="recipe-card-title">{recipe.title}</h3>
            <p className="recipe-card-meta">
              ⏱ {recipe.cookTime} • 🍴 {recipe.categoryName}
            </p>
          </div>
        </Link>
      ))}
    </section>

    {userRecipes.length > recipesPerPage && (
      <Pagination
        totalItems={userRecipes.length}
        itemsPerPage={recipesPerPage}
        currentPage={recipesPage}
        onPageChange={setRecipesPage}
      />
    )}
  </>
) : (
  <p className="no-recipes">Người dùng này chưa có món ăn nào được đăng.</p>
)}

            </div>
        </main>
    );
}