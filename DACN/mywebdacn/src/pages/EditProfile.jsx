import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "./EditProfile.css";

export default function EditProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState(""); // ✅ chỉ còn description
  const [errors, setErrors] = useState({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const avatarInputRef = useRef(null);

  // ✅ Load profile từ API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8888/api/v1/users/me", {
  headers: { Authorization: `Bearer ${token}` },
});
console.log("Status:", res.status);
const data = await res.json();
if (!res.ok) {
  console.error("API lỗi:", res.status, data);
} else {
  setProfile(data);
}


        // Gán dữ liệu vào state
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setDescription(data.description || "");
        setAvatarUrl(data.avatarUrl || "");
      } catch (err) {
        console.error("Lỗi khi tải profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) e.email = "Email không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ✅ Cập nhật thông tin cá nhân
  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch(`/api/v1/users/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          description,   // ✅ chỉ gửi description
        }),
      });
      if (!res.ok) throw new Error("Không thể cập nhật hồ sơ");
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Có lỗi xảy ra khi lưu thay đổi");
    }
  }

  // ✅ Upload avatar
  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/v1/users/${profile.id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Không thể upload avatar");
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      alert("Đổi avatar thành công!");
    } catch (err) {
      console.error("Lỗi khi upload avatar:", err);
      alert("Có lỗi xảy ra khi đổi avatar");
    }
  }

  function pickAvatar() {
    avatarInputRef.current?.click();
  }

  function onAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    uploadAvatar(file);
  }

  if (!profile) return <p>Đang tải hồ sơ...</p>;

  return (
    <div className="edit-profile-page">
      <main className="edit-container">
        <div className="profile-header">
          <div
            className="avatar-section"
            onClick={pickAvatar}
            title="Chọn ảnh đại diện"
          >
            {avatarUrl ? (
              <img src={`http://localhost:8888${avatarUrl}`} alt="Avatar" />
            ) : (
              <span className="placeholder">Chọn ảnh</span>
            )}
            <div
              className="edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                pickAvatar();
              }}
            >
              <img src="/image/butchi.png" alt="Edit" />
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={onAvatarChange}
            />
          </div>
          <h1 className="page-title">Chỉnh Sửa Bếp Cá Nhân Của Tôi</h1>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và Tên
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && (
              <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>
                {errors.fullName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô tả / Tiểu sử
            </label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Viết mô tả hoặc tiểu sử của bạn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="save-container">
            <button type="submit" className="save-btn">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
