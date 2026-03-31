import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // --- STATE CHO THÔNG BÁO ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null); 
  
  const { token, isAuthenticated, logout } = useAuth();

  // ✅ Helper function: Xử lý hiển thị ảnh
  const getAvatarSrc = (url) => {
    if (!url) return "/image/default-avatar.png";
    if (url.startsWith("http") || url.startsWith("https")) {
      return url;
    }
    return `http://localhost:8888${url}`;
  };

  // ✅ FIX LOGIC LẤY THÔNG BÁO TỪ DANH SÁCH MÓN ĂN
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      // 1. Gọi API lấy danh sách món ăn của tôi
      const res = await fetch("http://localhost:8888/api/v1/recipes?creator=me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const recipes = await res.json();
        
        // 2. Lọc ra các món đã có kết quả (Approved hoặc Rejected)
        // Sắp xếp món mới nhất lên đầu
        const processedRecipes = recipes
            .filter(r => r.status === 'APPROVED' || r.status === 'REJECTED')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp theo ngày tạo mới nhất

        // 3. Chuyển đổi thành format thông báo
        const notiList = processedRecipes.map(recipe => ({
            id: recipe.id,
            recipeId: recipe.id,
            title: recipe.title,
            status: recipe.status,
            // Backend thường trả về rejectionReason hoặc reason, adminComment
            reason: recipe.rejectionReason || recipe.reason, 
            adminComment: recipe.adminComment,
            createdAt: recipe.createdAt,
            isRead: false // Tạm thời giả định là chưa đọc
        }));

        setNotifications(notiList);
        setUnreadCount(notiList.length);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  }, [token]);

  // 1. Lấy Profile và Thông báo
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:8888/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setProfile(null);
          if (res.status === 401 || res.status === 403) {
            logout();
          }
          return;
        }

        const data = await res.json();
        setProfile(data);
        
        // Gọi hàm lấy thông báo
        fetchNotifications();

      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token, logout, fetchNotifications]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý click ra ngoài để đóng thông báo
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đồng bộ trạng thái đăng nhập
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNotificationClick = (recipeId) => {
      navigate(`/recipes/${recipeId}`);
      setShowNotifications(false);
  };

  const handleBrandClick = () => {
    navigate("/");
  };

  const handleBrandHover = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleBrandLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  const handleLoginHover = (e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.35)";
  };

  const handleLoginLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.25)";
  };

  const handleBellHover = (e) => {
    e.currentTarget.style.borderColor = "#0EA5E9";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.2)";
  };

  const handleBellLeave = (e) => {
    e.currentTarget.style.borderColor = "#E2E8F0";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";
  };
  
  const handleAvatarHover = (e) => {
    e.currentTarget.style.borderColor = "#0EA5E9";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.2)";
  };
  
  const handleAvatarLeave = (e) => {
    e.currentTarget.style.borderColor = "#E0F2FE";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";
  };

  const styles = {
    header: {
      width: "100%",
      height: scrolled ? 80 : 100,
      position: "fixed",
      top: 0,
      left: 0,
      backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "white",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      boxShadow: scrolled
        ? "0 4px 20px rgba(0, 0, 0, 0.08)"
        : "0 2px 8px rgba(0, 0, 0, 0.05)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 60px",
      boxSizing: "border-box",
      transition: "all 0.3s ease",
      borderBottom: scrolled
        ? "1px solid rgba(14, 165, 233, 0.1)"
        : "1px solid transparent",
    },
    container: {
      width: "100%",
      maxWidth: 1517,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: "pointer",
      transition: "transform 0.3s ease",
    },
    logoWrapper: {
      width: scrolled ? 45 : 50,
      height: scrolled ? 45 : 50,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(14, 165, 233, 0.15)",
    },
    logo: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    brandTitle: {
      fontSize: scrolled ? 18 : 20,
      fontWeight: 800,
      background: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontFamily: "'Inter', sans-serif",
      letterSpacing: "0.5px",
      transition: "all 0.3s ease",
    },
    nav: {
      display: "flex",
      gap: 40,
      alignItems: "center",
    },
    link: {
      textDecoration: "none",
      fontSize: 16,
      fontWeight: 600,
      color: "#64748B",
      transition: "all 0.3s ease",
      position: "relative",
      padding: "8px 4px",
      fontFamily: "'Inter', sans-serif",
    },
    linkActive: {
      color: "#0EA5E9",
      fontWeight: 700,
    },
    authControls: {
      display: "flex",
      alignItems: "center",
      gap: 16,
    },
    loginBtn: {
      padding: "12px 28px",
      background: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
      borderRadius: 12,
      color: "white",
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
      boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
      fontFamily: "'Inter', sans-serif",
    },
    bellWrap: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      backgroundColor: "white",
      border: "2px solid #E2E8F0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      border: "2px solid white",
      fontSize: 10,
      fontWeight: 700,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    notificationDropdown: {
        position: "absolute",
        top: "60px",
        right: "-80px",
        width: "350px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        border: "1px solid #E2E8F0",
        zIndex: 2001,
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-out",
        maxHeight: "400px",
        overflowY: "auto",
    },
    notifyHeader: {
        padding: "12px 16px",
        borderBottom: "1px solid #E2E8F0",
        fontWeight: "700",
        fontSize: "14px",
        color: "#1E293B",
        backgroundColor: "#F8FAFC",
    },
    notifyItem: {
        padding: "12px 16px",
        borderBottom: "1px solid #F1F5F9",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    notifyTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#334155",
        margin: 0,
    },
    statusBadge: (status) => ({
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
        width: "fit-content",
        backgroundColor: status === "APPROVED" ? "#DCFCE7" : "#FEE2E2",
        color: status === "APPROVED" ? "#166534" : "#991B1B",
    }),
    notifyReason: {
        fontSize: "13px",
        color: "#EF4444",
        margin: 0,
        fontStyle: "italic",
    },
    adminReply: {
        fontSize: "13px",
        color: "#0F766E",
        margin: 0,
        backgroundColor: "#F0FDFA",
        padding: "6px",
        borderRadius: "6px",
        marginTop: "4px",
    },
    emptyNotify: {
        padding: "20px",
        textAlign: "center",
        color: "#94A3B8",
        fontSize: "14px",
    },
    avatarWrapper: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      border: "none",
      padding: 2,
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "transparent",
    },
    avatar: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #E2E8F0",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s ease",
    },
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Logo */}
          <div
            style={styles.brandWrap}
            onClick={handleBrandClick}
            onMouseEnter={handleBrandHover}
            onMouseLeave={handleBrandLeave}
          >
            <div style={styles.logoWrapper}>
              <img src="/image/logo.png" alt="Logo" style={styles.logo} />
            </div>
            <span style={styles.brandTitle}>TY'S KITCHEN</span>
          </div>

          {/* Menu */}
          <nav style={styles.nav}>
            <NavLink to="/" style={({ isActive }) => (isActive ? { ...styles.link, ...styles.linkActive } : styles.link)}>TRANG CHỦ</NavLink>
            <NavLink to="/recipes" style={({ isActive }) => (isActive ? { ...styles.link, ...styles.linkActive } : styles.link)}>MÓN ĂN</NavLink>
            <NavLink to="/articles" style={({ isActive }) => (isActive ? { ...styles.link, ...styles.linkActive } : styles.link)}>BÀI VIẾT</NavLink>
            <NavLink to="/contact" style={({ isActive }) => (isActive ? { ...styles.link, ...styles.linkActive } : styles.link)}>LIÊN HỆ</NavLink>
          </nav>

          {/* Login / User */}
          <div style={styles.authControls}>
            {!isLoggedIn ? (
              <button
                style={styles.loginBtn}
                onMouseEnter={handleLoginHover}
                onMouseLeave={handleLoginLeave}
                onClick={handleLoginClick}
              >
                Đăng nhập
              </button>
            ) : (
              <>
                {/* --- ICON CHUÔNG THÔNG BÁO --- */}
                <div style={{ position: "relative" }} ref={notificationRef}>
                    <div
                      style={styles.bellWrap}
                      onMouseEnter={handleBellHover}
                      onMouseLeave={handleBellLeave}
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0EA5E9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      {unreadCount > 0 && <div style={styles.notificationBadge}>{unreadCount}</div>}
                    </div>

                    {/* --- DROPDOWN THÔNG BÁO --- */}
                    {showNotifications && (
                        <div style={styles.notificationDropdown}>
                            <div style={styles.notifyHeader}>Thông báo món ăn</div>
                            {notifications.length === 0 ? (
                                <div style={styles.emptyNotify}>Không có thông báo mới</div>
                            ) : (
                                notifications.map((notify) => (
                                    <div 
                                        key={notify.id} 
                                        style={styles.notifyItem}
                                        onClick={() => handleNotificationClick(notify.recipeId)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                    >
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <h4 style={styles.notifyTitle}>{notify.title}</h4>
                                            <span style={styles.statusBadge(notify.status)}>
                                                {notify.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                                            </span>
                                        </div>
                                        
                                        {notify.status === 'REJECTED' && notify.reason && (
                                            <p style={styles.notifyReason}>
                                                ⚠️ Lý do: {notify.reason}
                                            </p>
                                        )}

                                        {notify.adminComment && (
                                            <p style={styles.adminReply}>
                                                💬 Admin: "{notify.adminComment}"
                                            </p>
                                        )}
                                        
                                        <span style={{fontSize: '11px', color: '#94A3B8'}}>
                                            {notify.createdAt || 'Vừa xong'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div
                  style={styles.avatarWrapper}
                  onClick={handleProfileClick}
                  onMouseEnter={handleAvatarHover}
                  onMouseLeave={handleAvatarLeave}
                >
                  {profile?.avatarUrl && (
                    <img
                      src={getAvatarSrc(profile.avatarUrl)}
                      alt="Avatar"
                      style={styles.avatar}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/image/default-avatar.png";
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        a[href] { position: relative; }
        a[href]::after {
          content: ''; position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%); width: 0; height: 2px;
          background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
          transition: width 0.3s ease;
        }
        a[href]:hover::after { width: 100%; }
        a[href].active::after { width: 100%; }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 992px) {
          header { padding: 0 30px !important; }
          nav { gap: 20px !important; }
          nav a { font-size: 14px !important; }
        }
        @media (max-width: 768px) {
          header { padding: 0 20px !important; }
          nav { display: none !important; }
        }
      `}</style>
    </>
  );
}