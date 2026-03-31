import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google"; // 1. Import Google Login
import FacebookLogin from "@greatsumini/react-facebook-login"; // 2. Import Facebook Login
import "./LoginRegister.css";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const { login } = useAuth();
  
  // State cho form đăng nhập/đăng ký
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPassword2, setRegisterPassword2] = useState("");

  // Hàm xử lý chung sau khi có Token từ Backend (dùng cho cả Login thường và Social)
  const handleAuthSuccess = (token) => {
    if (!token) return;
    
    // Lưu token
    login(token);
    alert("Đăng nhập thành công!");

    // Giải mã để điều hướng
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
      navigate("/");
    }
  };

  // --- XỬ LÝ LOGIN THƯỜNG ---
  async function onSubmitLogin(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8888/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) throw new Error("Email hoặc mật khẩu không chính xác.");

      const data = await response.json();
      handleAuthSuccess(data.token);

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert(`Lỗi: ${error.message}`);
    }
  }

  // --- XỬ LÝ ĐĂNG KÝ ---
  async function onSubmitRegister(e) {
    e.preventDefault();
    if (registerPassword !== registerPassword2) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8888/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registerFullName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đăng ký thất bại.");
      }

      alert("Đăng ký thành công! Vui lòng chuyển qua tab Đăng nhập.");
      setActiveTab("login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(`Lỗi: ${error.message}`);
    }
  }

  // --- XỬ LÝ GOOGLE LOGIN ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      
      const res = await fetch("http://localhost:8888/api/v1/auth/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      if (res.ok) {
        const data = await res.json();
        handleAuthSuccess(data.token);
      } else {
        alert("Đăng nhập Google thất bại!");
      }
    } catch (error) {
      console.error("Google Login Error", error);
    }
  };

  // --- XỬ LÝ FACEBOOK LOGIN ---
  const handleFacebookSuccess = async (response) => {
    try {
      if (response.accessToken) {
        const res = await fetch("http://localhost:8888/api/v1/auth/login/facebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.accessToken }),
        });

        if (res.ok) {
          const data = await res.json();
          handleAuthSuccess(data.token);
        } else {
            alert("Đăng nhập Facebook thất bại!");
        }
      }
    } catch (error) {
      console.error("Facebook Login Error", error);
    }
  };

  return (
    <div className="auth-page">
      {/* Tabs */}
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => setActiveTab("login")}
        >
          Đăng Nhập
        </button>
        <button
          className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Đăng Ký
        </button>
      </div>

      <div className="auth-form-container">
        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={onSubmitLogin} className="auth-form">
            <h2 className="form-title">Chào mừng trở lại!</h2>
            <input
              type="email"
              placeholder="Email *"
              required
              className="form-input"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu *"
              required
              className="form-input"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button type="submit" className="form-button primary">
              ĐĂNG NHẬP
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form onSubmit={onSubmitRegister} className="auth-form">
            <h2 className="form-title">Tạo tài khoản mới</h2>
            <input
              type="text"
              placeholder="Họ tên *"
              required
              className="form-input"
              value={registerFullName}
              onChange={(e) => setRegisterFullName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email *"
              required
              className="form-input"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu *"
              required
              className="form-input"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu *"
              required
              className="form-input"
              value={registerPassword2}
              onChange={(e) => setRegisterPassword2(e.target.value)}
            />
            <button type="submit" className="form-button secondary">
              ĐĂNG KÝ
            </button>
          </form>
        )}
      </div>

      {/* Social Login */}
      <div className="social-login">
        <p className="social-login-text">Hoặc tiếp tục với</p>
        <div className="social-login-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          
          {/* Nút Google */}
          <div className="google-btn-wrapper">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Google Login Failed')}
                type="icon" // Chỉ hiện icon cho gọn, hoặc bỏ đi để hiện nút đầy đủ
                shape="circle"
             />
          </div>

          {/* Nút Facebook */}
          <FacebookLogin
            appId="866152992691026" // Thay bằng App ID của bạn
            onSuccess={handleFacebookSuccess}
            onFail={(error) => console.log('Facebook Login Failed!', error)}
            render={({ onClick }) => (
               <button onClick={onClick} className="social-icon-btn facebook-btn">
                  <img
                    src="https://img.icons8.com/fluency/48/000000/facebook-new.png"
                    alt="Facebook"
                    className="social-icon"
                  />
               </button>
            )}
          />
        </div>
        
        <p className="terms-text">
          Bằng cách vào Tiếp tục với Google hoặc Facebook, bạn đồng ý với
          Điều khoản sử dụng của chúng tôi.
        </p>
      </div>
    </div>
  );
}