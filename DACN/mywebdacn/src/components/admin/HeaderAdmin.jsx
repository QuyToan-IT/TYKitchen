import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../hooks/useAuth";
import "./HeaderAdmin.css";

// Quản lý các đường dẫn ảnh tập trung
const IMAGE_PATHS = {
  LOGO: "/image/logo.png",
  SETTINGS: "/image/setting.png",
  NOTIFICATIONS: "/image/thongbao.png",
  DEFAULT_PROFILE: "/image/profile.jpg",
};

const HeaderAdmin = ({ title }) => {
  const { token, logout } = useAuth(); // Lấy thêm hàm logout
  const [profile, setProfile] = useState(null);
  const [showSettings, setShowSettings] = useState(false); // State quản lý ẩn/hiện menu
  const navigate = useNavigate();
  const settingsRef = useRef(null); // Ref để xử lý click ra ngoài

  // ✅ Helper function: Xử lý hiển thị ảnh (tương tự trang Profile)
  const getAvatarSrc = (url) => {
    if (!url) return IMAGE_PATHS.DEFAULT_PROFILE;
    
    // Nếu là ảnh Google/Facebook -> Giữ nguyên (có thể thêm logic lấy ảnh HD nếu muốn)
    if (url.startsWith("http") || url.startsWith("https")) {
       if (url.includes('googleusercontent.com')) return url.replace(/=s\d+(-c)?/g, '=s96-c'); // Lấy ảnh nét hơn chút
       return url;
    }
    
    // Nếu là ảnh upload local -> Nối thêm domain server
    return `http://localhost:8888${url}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8888/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };
    fetchProfile();
  }, [token]);

  // Logic đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <img src={IMAGE_PATHS.LOGO} alt="TY'S KITCHEN Logo" className="logo" />
        <div className="header-title">{title}</div>
      </div>
      
      <div className="header-right">
        {/* --- Dropdown Menu Cài đặt --- */}
        <div className="settings-wrapper" ref={settingsRef}>
          <button 
            type="button" 
            className="icon-button" 
            aria-label="Cài đặt"
            onClick={() => setShowSettings(!showSettings)}
          >
            <img src={IMAGE_PATHS.SETTINGS} alt="Cài đặt" />
          </button>

          {/* Menu xổ xuống */}
          {showSettings && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleGoHome}>
                🏠 Trang chủ
              </div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                🚪 Đăng xuất
              </div>
            </div>
          )}
        </div>

        <button type="button" className="icon-button" aria-label="Thông báo">
          <img src={IMAGE_PATHS.NOTIFICATIONS} alt="Thông báo" />
        </button>

        {/* --- Ảnh đại diện đã sửa logic --- */}
        <img
          src={getAvatarSrc(profile?.avatarUrl)}
          alt="Profile"
          className="profile-pic"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = IMAGE_PATHS.DEFAULT_PROFILE;
          }}
        />
      </div>
    </header>
  );
};

HeaderAdmin.propTypes = {
  title: PropTypes.string,
};

HeaderAdmin.defaultProps = {
  title: "Dashboard Admin",
};

export default HeaderAdmin;