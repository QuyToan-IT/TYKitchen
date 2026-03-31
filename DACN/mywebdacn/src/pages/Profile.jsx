import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import './Profile.css';

export default function Profile() {
    const css = useMemo(
        () => `
        :root {
            --primary: #0EA5E9;
            --primary-dark: #0284C7;
            --accent: #F0FDFA;
            --text: #0F172A;
            --text-muted: #64748B;
            --card-radius: 12px;
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
        }

        .profile-page {
            font-family: 'Inter', sans-serif;
            background-color: #F8FAFC;
            min-height: 100vh;
            padding: 40px 0;
        }

        .profile-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        /* --- Header Section --- */
        .profile-header {
            display: flex;
            align-items: center;
            gap: 30px;
            padding: 30px;
            background: white;
            border-radius: 20px;
            box-shadow: var(--shadow-md);
        }

        .avatar-wrapper {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid var(--primary-light);
            flex-shrink: 0;
            background-color: #E2E8F0;
        }

        .avatar-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .profile-info {
            flex-grow: 1;
        }

        .profile-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .profile-name {
            font-size: 28px;
            font-weight: 800;
            color: var(--text);
        }

        .settings-btn {
            cursor: pointer;
            font-size: 24px;
            transition: transform 0.2s;
        }

        .settings-btn:hover {
            transform: rotate(30deg);
        }

        .settings-menu {
            position: absolute;
            top: 40px;
            right: 0;
            background: white;
            border-radius: var(--card-radius);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            width: 180px;
            overflow: hidden;
            z-index: 100;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease-out;
        }

        .settings-menu.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .menu-item {
            padding: 10px 15px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text);
            transition: background-color 0.15s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .menu-item:hover {
            background-color: var(--primary-light);
            color: var(--primary-dark);
        }

        .profile-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }

        .stat-item strong {
            font-weight: 700;
            color: var(--primary);
            margin-right: 4px;
        }

        .profile-description {
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* --- Action Buttons --- */
        .action-buttons {
            display: flex;
            gap: 15px;
        }

        .action-btn {
            padding: 10px 20px;
            border-radius: var(--card-radius);
            font-weight: 600;
            text-decoration: none;
            transition: background-color 0.2s, transform 0.2s;
            border: 1px solid #E2E8F0;
            color: var(--text);
            background: white;
        }

        .action-btn.primary {
            background-color: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        
        .action-btn.admin-btn {
            background-color: #FBBF24;
            color: var(--text);
            border-color: #FBBF24;
        }

        .action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        /* --- Tabs --- */
        .tabs {
            display: flex;
            border-bottom: 2px solid #E2E8F0;
        }

        .tab {
            padding: 15px 25px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-muted);
            transition: color 0.2s, border-bottom 0.2s;
        }

        .tab.active {
            color: var(--primary-dark);
            border-bottom: 2px solid var(--primary-dark);
            margin-bottom: -2px;
        }

        /* --- Recipe Grid --- */
        .recipe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
        }

        .recipe-card {
            background: white;
            border-radius: var(--card-radius);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            text-decoration: none;
            transition: transform 0.2s;
            position: relative;
        }

        .recipe-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }

        .recipe-card-image {
            height: 180px;
            overflow: hidden;
            position: relative;
        }

        .recipe-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .recipe-card-body {
            padding: 15px;
        }

        .recipe-card-body h3 {
            font-size: 18px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 5px;
        }

        .recipe-card-body p {
            font-size: 14px;
            color: var(--text-muted);
        }

        .status-tag {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            z-index: 5;
            color: white;
        }

        .status-tag.PENDING {
            background-color: #FBBF24; /* Màu vàng cam */
        }

        @media (max-width: 768px) {
            .profile-header {
                flex-direction: column;
                text-align: center;
                gap: 15px;
                padding: 20px;
            }
            .profile-info {
                width: 100%;
            }
            .profile-title-row {
                justify-content: center;
                gap: 15px;
            }
            .profile-stats {
                justify-content: center;
                gap: 15px;
            }
            .action-buttons {
                flex-direction: column;
            }
            .recipe-grid {
                grid-template-columns: 1fr;
            }
            .like-btn {
                position: absolute;
                bottom: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                background: white;
                border-radius: 50%;
                box-shadow: var(--shadow-md);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s ease;
                z-index: 10;
            }
            .like-btn img {
                width: 18px;
                height: 18px;
            }
            .like-btn:hover {
                transform: scale(1.1);
            }
            .status-tag.APPROVED {
                background-color: #22C55E;
            }
            .recipe-card-body h3 {
                transition: color 0.2s ease;
            }
            .recipe-card:hover .recipe-card-body h3 {
                color: var(--primary-dark);
            }
        }
        `,
        []
    );

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

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("recipes");
    const [recipesPage, setRecipesPage] = useState(1);
    const [savedPage, setSavedPage] = useState(1);
    const recipesPerPage = 10;
    const [menuOpen, setMenuOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const menuRef = useRef(null);
    const settingsBtnRef = useRef(null);
    const { logout, token } = useAuth();

    console.log("Token hiện tại:", token);

    const getAvatarSrc = (url) => {
        if (!url) return "/image/default-avatar.png";
        if (url.includes('googleusercontent.com')) return url.replace(/=s\d+(-c)?/g, '=s400-c');
        if (url.includes('graph.facebook.com')) {
             const separator = url.includes('?') ? '&' : '?';
             return `${url}${separator}width=400&height=400`;
        }
        if (url.startsWith("http") || url.startsWith("https")) return url;
        return `http://localhost:8888${url}`;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return; 
            try {
                const res = await fetch("http://localhost:8888/api/v1/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    logout(); 
                    return;
                }
                if (!res.ok) throw new Error(`Không thể lấy hồ sơ: ${res.statusText}`);
                const data = await res.json();
                if (!data.role) data.role = 'user';
                setProfile(data);
            } catch (err) {
                console.error("Lỗi khi lấy profile:", err);
            }
        };
        fetchProfile();
    }, [token, logout]);

    // ✅ LOGIC CHÍNH: Lấy dữ liệu và ẨN các bài bị từ chối
    useEffect(() => {
        if (!token) return;

        const fetchMyRecipes = async () => {
            try {
                const res = await fetch("http://localhost:8888/api/v1/recipes?creator=me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Không thể lấy món ăn đã đăng");
                const data = await res.json();
                
                // 👉 LỌC BỎ các món có status là REJECTED tại đây
                // Chỉ giữ lại APPROVED và PENDING
                const validRecipes = data.filter(recipe => recipe.status !== 'REJECTED');
                
                setMyRecipes(validRecipes);
            } catch (err) {
                console.error("Lỗi khi lấy recipes:", err);
            }
        };

        const fetchSavedRecipes = async () => {
            try {
                let userId = null;
                if (token) {
                    const decoded = jwtDecode(token);
                    userId = decoded.userId;
                }
                const res = await fetch("http://localhost:8888/api/v1/favorites", {
                    headers: {
                        "Authorization": `Bearer ${token}`, 
                        "x-user-id": userId                 
                    },
                });
                if (!res.ok) throw new Error("Lỗi API favorites");
                let data = await res.json();
                if (!Array.isArray(data)) data = [];

                // 👉 CŨNG LỌC BỎ món bị từ chối trong danh sách đã lưu (nếu có)
                const validSaved = data.filter(item => item.recipe?.status !== 'REJECTED');

                setSavedRecipes(validSaved);
            } catch (err) {
                console.error("Lỗi khi lấy favorites:", err);
            }
        };

        fetchMyRecipes();
        fetchSavedRecipes();
    }, [token]);

    useEffect(() => {
        const handler = (e) => {
            if (!menuRef.current || !settingsBtnRef.current) return;
            if (!menuRef.current.contains(e.target) && !settingsBtnRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const onShare = useCallback(async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Hồ sơ Bếp của tôi",
                    url: window.location.href,
                });
            } else {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(window.location.href);
                    console.warn("Đã sao chép liên kết.");
                }
            }
        } catch (e) {
            console.debug("Share canceled", e);
        } finally {
            setMenuOpen(false);
        }
    }, []);

    const onLogout = useCallback(() => {
        logout();
        setMenuOpen(false);
        navigate("/login");
    }, [logout, navigate]);

    const onGoToAdmin = useCallback(() => {
        navigate("/admin");
    }, [navigate]);

    const recipesIndexOfLast = recipesPage * recipesPerPage;
    const recipesIndexOfFirst = recipesIndexOfLast - recipesPerPage;
    const paginatedMyRecipes = myRecipes.slice(recipesIndexOfFirst, recipesIndexOfLast);

    const savedIndexOfLast = savedPage * recipesPerPage;
    const savedIndexOfFirst = savedIndexOfLast - recipesPerPage;
    const paginatedSavedRecipes = savedRecipes.slice(savedIndexOfFirst, savedIndexOfLast);

    if (!profile) return <p>Đang tải hồ sơ...</p>;

    return (
        <main className="profile-page">
            <style>{css}</style>
            <div className="profile-container">
                <section className="profile-header">
                    <div className="avatar-wrapper">
                        {profile.avatarUrl && (
                            <img
                                src={getAvatarSrc(profile.avatarUrl)}
                                alt="avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/image/default-avatar.png";
                                }}
                            />
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="profile-title-row">
                            <h1 className="profile-name">{profile.fullName}</h1>
                            <div style={{ position: "relative" }}>
                                <div
                                    ref={settingsBtnRef}
                                    className="settings-btn"
                                    onClick={() => setMenuOpen((s) => !s)}
                                    title="Cài đặt"
                                >
                                    ⚙️
                                </div>
                                <div
                                    ref={menuRef}
                                    className={`settings-menu ${menuOpen ? "open" : ""}`}
                                >
                                    {profile.role === 'ADMIN' && (
                                        <div className="menu-item" onClick={onGoToAdmin}>
                                            🔧 Trang quản trị
                                        </div>
                                    )}
                                    <div className="menu-item" onClick={onShare}>
                                        🔗 Chia sẻ
                                    </div>
                                    <div className="menu-item" onClick={onLogout} style={{ color: '#EF4444' }}>
                                        🚪 Đăng xuất
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <strong>{myRecipes.length}</strong> món ăn
                            </div>
                            <div className="stat-item">
                                <strong>{profile.followers || 0}</strong> người quan tâm
                            </div>
                            <div className="stat-item">
                                <strong>{savedRecipes.length}</strong> đã lưu
                            </div>
                        </div>

                        {profile.description && (
                            <p className="profile-description">{profile.description}</p>
                        )}
                    </div>
                </section>

                <section className="action-buttons">
                    <Link to="/profile/edit" className="action-btn">
                        Chỉnh sửa thông tin cá nhân
                    </Link>
                    {profile.role === 'ADMIN' && (
                        <Link to="/admin/duyetbai" className="action-btn admin-btn">
                            Quản lý Duyệt bài
                        </Link>
                    )}
                    <Link to="/recipes/new" className="action-btn primary">
                        Thêm món ăn mới
                    </Link>
                </section>

                <section className="tabs">
                    <div
                        className={`tab ${activeTab === "recipes" ? "active" : ""}`}
                        onClick={() => setActiveTab("recipes")}
                    >
                        Món ăn ({myRecipes.length})
                    </div>
                    <div
                        className={`tab ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Đã lưu ({savedRecipes.length})
                    </div>
                </section>

                {activeTab === "recipes" ? (
                    <>
                        <section className="recipe-grid">
                            {paginatedMyRecipes.length === 0 ? (
                                <p>Chưa có món ăn nào được đăng (hoặc đang chờ duyệt).</p>
                            ) : (
                                paginatedMyRecipes.map((recipe) => (
                                    <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-card">
                                        {/* Không cần check REJECTED nữa vì đã lọc ở trên */}
                                        {recipe.status === 'PENDING' && (
                                            <div className={`status-tag ${recipe.status}`}>
                                                Chờ duyệt
                                            </div>
                                        )}
                                        <div className="recipe-card-image">
                                            <img
                                                src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
                                                alt={recipe.title}
                                            />
                                        </div>
                                        <div className="recipe-card-body">
                                            <h3>{recipe.title}</h3>
                                            <p>{recipe.categoryName}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </section>
                        <Pagination
                            totalItems={myRecipes.length}
                            itemsPerPage={recipesPerPage}
                            currentPage={recipesPage}
                            onPageChange={setRecipesPage}
                        />
                    </>
                ) : (
                    <>
                        <section className="recipe-grid">
                            {paginatedSavedRecipes.length === 0 ? (
                                <p>Chưa có món ăn nào đã lưu.</p>
                            ) : (
                                paginatedSavedRecipes.map((item) => {
                                    const recipe = item.recipe;
                                    return (
                                        <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-card">
                                            {recipe.status === 'PENDING' && (
                                                <div className={`status-tag ${recipe.status}`}>
                                                    Chờ duyệt
                                                </div>
                                            )}
                                            <div className="recipe-card-image">
                                                <img
                                                    src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
                                                    alt={recipe.title}
                                                />
                                                <div className="like-btn">
                                                    <img src="/image/traitim.png" alt="Icon trái tim đỏ" />
                                                </div>
                                            </div>
                                            <div className="recipe-card-body">
                                                <h3>{recipe.title}</h3>
                                                <p>{recipe.categoryName}</p>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </section>
                        <Pagination
                            totalItems={savedRecipes.length}
                            itemsPerPage={recipesPerPage}
                            currentPage={savedPage}
                            onPageChange={setSavedPage}
                        />
                    </>
                )}
            </div>
        </main>
    );
}