import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function AddRecipe() {
  const css = useMemo(
    () => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

:root {
  --maxw: 1517px;
  --primary: #0EA5E9;
  --primary-dark: #0284C7;
  --primary-light: #E0F2FE;
  --accent: #F0FDFA;
  --text: #0F172A;
  --text-muted: #64748B;
  --card-radius: 20px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);
  --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.add-recipe-page {
  background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  width: 100%;
  padding: 60px 24px;
  overflow-x: hidden;
}

main {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  background: white;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-lg);
  padding: 48px;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 2px solid #F1F5F9;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
  background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-muted);
  line-height: 1.6;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
  border-radius: 2px;
}

.form-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border-radius: 12px;
  border: 2px solid #E2E8F0;
  font-family: 'Inter', sans-serif;
  color: var(--text);
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-select {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%230EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px;
  cursor: pointer;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.image-upload-section {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-radius: 16px;
  padding: 32px;
  border: 2px dashed #CBD5E1;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.image-upload {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.image-box {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid #E2E8F0;
  transition: all 0.3s ease;
}

.image-box:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.image-box input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
}

.image-placeholder-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--primary);
}

.image-placeholder-text {
  font-size: 14px;
  font-weight: 500;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  z-index: 3;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.remove-image-btn:hover {
  background: #DC2626;
  transform: scale(1.1);
}

.upload-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 12px;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid #F1F5F9;
}

.btn-cancel {
  padding: 16px 32px;
  background: white;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  border-color: var(--text-muted);
  background: #F8FAFC;
}

.btn-submit {
  padding: 16px 40px;
  background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
}

@media (max-width: 768px) {
  main {
    padding: 32px 24px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .grid-2,
  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .image-box {
    width: 100%;
    height: 220px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}

.ck-content {
  color: black !important;
}
`,
    []
  );

  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]); // State để lưu danh mục từ backend
  

  const [form, setForm] = useState({
    name: "",
    servings: "",
    difficulty: "EASY",
    cookTime: "",
    category: "",
    description: "",
    ingredientsMain: "",
    spices: "",
    steps: "",
    nutrition: {
      calories: "",
      fat: "",
      protein: "",
      carbs: "",
      cholesterol: "",
    },
  });

  // State để lưu cả file và preview
  const [avatar, setAvatar] = useState({ file: null, preview: null });

  // Ref cho input file
  const avatarInputRef = useRef(null);
    // 👉 thêm state cho AI gợi ý
  const [suggestion, setSuggestion] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [hasAcceptedDescription, setHasAcceptedDescription] = useState(false);

  // Lấy danh sách danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8888/api/v1/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải danh mục");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, [token]);
  useEffect(() => {
  if (
    form.description.trim().length > 10 ||
    form.steps.trim().length > 10
  ) {
    handleEnhanceClick(); // gọi hàm để lấy gợi ý
  }
}, [form.description]);

  const onChange = (e) => {
    const { id, value } = e.target;
    if (["calories", "fat", "protein", "carbs", "cholesterol"].includes(id)) {
      setForm((s) => ({
        ...s,
        nutrition: { ...s.nutrition, [id]: value },
      }));
    } else {
      setForm((s) => ({ ...s, [id]: value }));
    }
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar({ file: file, preview: URL.createObjectURL(file) });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tên món ăn là bắt buộc.";
    if (!form.category) newErrors.category = "Vui lòng chọn danh mục.";
    if (!avatar.file) newErrors.avatar = "Ảnh đại diện là bắt buộc.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleEnhanceClick = async () => {
  if (isEnhancing) return; // chặn gọi lặp

  try {
    setIsEnhancing(true);

    const payload = {};
    if (form.description?.trim() && !hasAcceptedDescription) {
      payload.description = form.description.trim();
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    const res = await fetch("/api/v1/recipes/enhance/description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // ✅ Chỉ lấy nội dung gợi ý cho mô tả
    setSuggestion({
      description: data.result || null,
      steps: null,
    });
  } catch (error) {
    console.error("❌ Lỗi khi gọi AI gợi ý:", error.message || error);
    alert("Không thể gọi AI gợi ý. Vui lòng thử lại sau.");
  } finally {
    setIsEnhancing(false);
  }
};
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setIsLoading(true);

    // Lấy userId từ token
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId || decodedToken.sub; // Ưu tiên lấy userId, nếu không có thì lấy từ 'sub'

    // THÊM DÒNG NÀY ĐỂ KIỂM TRA
    console.log("KIỂM TRA DỮ LIỆU GỬI ĐI:", { userId: userId, token: decodedToken });

    // 1. Tạo đối tượng DTO khớp với CreatesRecipeRequest.java ở backend
    // Cấu trúc này phải khớp 100% với CreateRecipeRequest.java
    const createRecipeRequest = {
      userId: userId,
      title: form.name,
      categoryId: Number(form.category), // Gửi ID của category dưới dạng số
      description: form.description,
      servings: form.servings,
      difficulty: form.difficulty,
      cookTime: form.cookTime,
      ingredients: form.ingredientsMain.split('\n').filter(line => line.trim() !== ''),
      spices: form.spices.split('\n').filter(line => line.trim() !== ''), // Thêm gia vị
      steps: [form.steps], // Gửi toàn bộ nội dung HTML từ CKEditor như một bước
      nutritions: Object.entries(form.nutrition).filter(([, val]) => val.trim() !== "").map(([key, val]) => `${key}: ${val}`), // Thêm dinh dưỡng
    };

    // 2. Tạo FormData và append các part
    const formData = new FormData();

    // Append DTO dưới dạng chuỗi JSON với tên part là "dto"
    formData.append('dto', new Blob([JSON.stringify(createRecipeRequest)], {
      type: 'application/json'
    }));

    // Append file ảnh với tên part là "mainImage"
    if (avatar.file) {
      formData.append("mainImage", avatar.file);
    }

    try {
      const response = await fetch("http://localhost:8888/api/v1/recipes", {
        method: "POST",
        headers: {
          // Khi dùng fetch với FormData, không cần set 'Content-Type'.
          // Trình duyệt sẽ tự động thêm header đúng cùng với boundary.
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "Yêu cầu thất bại");
      }

      alert("Đăng công thức thành công! Bài viết của bạn đang chờ duyệt.");
      navigate("/profile"); // Chuyển hướng về trang cá nhân
    } catch (error) {
      console.error("Lỗi khi đăng công thức:", error.message);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-recipe-page">
      <style>{css}</style>
      <main>
        <div className="page-header">
          <h1 className="page-title">Thêm Công Thức Mới</h1>
          <p className="page-subtitle">
            Chia sẻ công thức nấu ăn yêu thích của bạn với cộng đồng
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* Tên món */}
          <div className="section">
            <h2 className="section-title">Thông tin cơ bản</h2>
            <label className="form-label">Tên món ăn</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Ví dụ: Cánh Gà Cay Thơm Ngon"
              value={form.name}
              onChange={onChange}
              required
            />
            {errors.name && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.name}
              </div>
            )}
          </div>

          {/* Thời gian */}
          <div className="section">
            <div className="grid-2">
              <div>
                <label className="form-label">Thời gian nấu</label>
                <input
                  id="cookTime"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: 30 phút"
                  value={form.cookTime}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <label className="form-label">Phục vụ (số người)</label>
                <input
                  id="servings"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: 2-3 người"
                  value={form.servings}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="form-label">Mức độ khó</label>
                <select id="difficulty" className="form-select" value={form.difficulty} onChange={onChange}>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danh mục */}
          <div className="section">
            <label className="form-label">Danh mục</label>
            <select id="category" className="form-select" value={form.category} onChange={onChange} required>
              <option value="" disabled>
                Chọn danh mục
              </option>
              {/* Lấy danh mục từ state */}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.category}
              </div>
            )}
          </div>

<div className="section">
  <label className="form-label">Mô tả món ăn</label>
  <textarea
    id="description"
    className="form-textarea"
    placeholder="Nhập mô tả ngắn..."
    value={form.description}
    onChange={onChange}
  />
  {isEnhancing && !hasAcceptedDescription && (
    <div style={{ marginTop: 6, fontSize: 13, color: "#0EA5E9" }}>
      Đang tạo gợi ý từ AI...
    </div>
  )}
  {!hasAcceptedDescription && suggestion?.description && (
    <div style={{ marginTop: 8, fontSize: 14, color: "#475569", fontStyle: "italic" }}>
      {suggestion.description} {/* ✅ chỉ hiển thị nội dung */}
      <div style={{ marginTop: 4 }}>
        <button onClick={() => {
          setForm(prev => ({ ...prev, description: suggestion.description }));
          setSuggestion(prev => ({ ...prev, description: null }));
          setHasAcceptedDescription(true);
        }}>✅</button>
        <button onClick={() => setSuggestion(prev => ({ ...prev, description: null }))}>❌</button>
      </div>
    </div>
  )}
</div>

{/* Nguyên liệu */}
<div className="section">
  <h2 className="section-title">Nguyên liệu</h2>
  <div className="grid-2">
    <div>
      <label className="form-label">Nguyên liệu chính</label>
      <textarea
        id="ingredientsMain"
        className="form-textarea"
        placeholder="Mỗi dòng là một nguyên liệu..."
        value={form.ingredientsMain}
        onChange={onChange}
      />
    </div>

    <div>
      <label className="form-label">Gia vị</label>
      <textarea
        id="spices"
        className="form-textarea"
        placeholder="Mỗi dòng là một gia vị..."
        value={form.spices}
        onChange={onChange}
      />
    </div>
  </div>
</div>
<div className="section">
  <h2 className="section-title">Hướng dẫn nấu</h2>
  <label className="form-label">Các bước thực hiện</label>
  <CKEditor
    editor={ClassicEditor}
    data={form.steps}
    onChange={(event, editor) => {
      const data = editor.getData();
      setForm(prev => ({ ...prev, steps: data }));
    }}
  />
</div>

          {/* Thông tin dinh dưỡng */}
          <div className="section">
            <h2 className="section-title">Thông tin dinh dưỡng</h2>
            <div className="nutrition-grid">
              <div>
                <label className="form-label">Calo (kcal)</label>
                <input
                  id="calories"
                  type="text"
                  className="form-input"
                  placeholder="250"
                  value={form.nutrition.calories}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="form-label">Chất béo (g)</label>
                <input
                  id="fat"
                  type="text"
                  className="form-input"
                  placeholder="15"
                  value={form.nutrition.fat}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="form-label">Protein (g)</label>
                <input
                  id="protein"
                  type="text"
                  className="form-input"
                  placeholder="20"
                  value={form.nutrition.protein}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="form-label">Carbs (g)</label>
                <input
                  id="carbs"
                  type="text"
                  className="form-input"
                  placeholder="30"
                  value={form.nutrition.carbs}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="form-label">Cholesterol (mg)</label>
                <input
                  id="cholesterol"
                  type="text"
                  className="form-input"
                  placeholder="50"
                  value={form.nutrition.cholesterol}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div className="section">
            <h2 className="section-title">Hình ảnh</h2>
            <div className="image-upload-section">
              <div className="upload-title">Ảnh đại diện món ăn</div>
              <div className="image-upload">
                <div className="image-box" onClick={() => avatarInputRef.current?.click()}>
                  {avatar.preview ? (
                    <img src={avatar.preview} alt="avatar" />
                  ) : (
                    <div className="image-placeholder">
                      <div className="image-placeholder-icon">+</div>
                      <div className="image-placeholder-text">Thêm ảnh</div>
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }} // Ẩn hoàn toàn input để tránh xung đột
                    onChange={onAvatarChange}
                  />
                </div>
              </div>
              {errors.avatar && (
                <div style={{ color: "red", fontSize: 14, marginTop: 10 }}>
                  {errors.avatar}
                </div>
              )}
            </div>
          </div>

          {/* Nút submit */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng công thức"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}