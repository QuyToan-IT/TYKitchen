import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./RecipeDetailsPage.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const fetchRecipeById = async (id, token) => {
  const response = await fetch(`/api/v1/recipes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Không thể tải dữ liệu món ăn");
  return response.json();
};

const updateRecipeById = async (id, token, updatedData) => {
  const response = await fetch(`/api/v1/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error("Cập nhật món ăn thất bại");
  return response.json();
};

const uploadImage = async (id, token, file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`/api/v1/recipes/${id}/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error("Upload ảnh thất bại");
  return response.json();
};

const fetchCategories = async (token) => {
  const res = await fetch(`/api/v1/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể tải danh mục");
  return res.json();
};

const RecipeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categories, setCategories] = useState([]);

  // Hardcode difficulties với label tiếng Việt
  const difficultyOptions = [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recipeData, catData] = await Promise.all([
          fetchRecipeById(id, token),
          fetchCategories(token),
        ]);

        // Chuẩn hóa difficulty về enum value
        let diffValue = recipeData.difficulty;
        if (diffValue === "Dễ") diffValue = "EASY";
        if (diffValue === "Trung bình") diffValue = "MEDIUM";
        if (diffValue === "Khó") diffValue = "HARD";

        setRecipe({ ...recipeData, difficulty: diffValue });
        setCategories(catData);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadData();
  }, [id, token]);

  const handleChange = (field, value) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field, value) => {
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
    setRecipe((prev) => ({ ...prev, [field]: lines }));
  };

  // Hàm xử lý thay đổi nội dung từng bước
  const handleStepChange = (index, data) => {
    const newSteps = [...(recipe.steps || [])];
    newSteps[index] = data;
    setRecipe((prev) => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setRecipe((prev) => ({ ...prev, steps: [...(prev.steps || []), ""] }));
  };

  const removeStep = (index) => {
    const newSteps = (recipe.steps || []).filter((_, i) => i !== index);
    setRecipe((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dto = {
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty, // enum value: EASY, MEDIUM, HARD
        categoryId: recipe.categoryId, // id từ select
        ingredients: recipe.ingredients,
        spices: recipe.spices,
        nutritions: recipe.nutritions,
        steps: recipe.steps,
      };

      console.log("Payload gửi lên:", dto); // ✅ debug payload

      await updateRecipeById(id, token, dto);
      alert("Đã cập nhật món ăn!");
      navigate(`/admin/recipes/details/${id}`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!newImage) return;
    try {
      const data = await uploadImage(id, token, newImage);
      setRecipe((prev) => ({ ...prev, mainImageUrl: data.mainImageUrl }));
      alert("Ảnh đã được cập nhật!");
    } catch (err) {
      alert(`Lỗi upload ảnh: ${err.message}`);
    }
  };

  if (error) return <div className="page-error">Lỗi: {error}</div>;
  if (!recipe) return <div className="page-loading">Đang tải dữ liệu món ăn...</div>;

  return (
    <div className="details-page-wrapper">
      <h1 className="details-main-title">CHỈNH SỬA MÓN ĂN</h1>

      <div className="detail-container">
        <DetailSection title="Ảnh đại diện">
          <div className="dish-image-container">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : `http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`
              }
              alt="Ảnh món ăn"
            />
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button
            onClick={handleImageUpload}
            className="action-button edit-btn"
            disabled={!newImage}
            style={{ marginTop: "10px" }}
          >
            Cập nhật ảnh
          </button>
        </DetailSection>

        <div className="title-row">
          <InfoField
            label="Tên món"
            value={recipe.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          {/* Danh mục chọn từ backend */}
          <div className="info-field">
            <label className="info-label">Danh mục:</label>
            <div className="value-box">
              <select
                value={recipe.categoryId || ""}
                onChange={(e) => handleChange("categoryId", parseInt(e.target.value))}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DetailSection title="Thông tin chung">
          <div className="time-row">
            <InfoField
              label="Thời gian nấu"
              value={recipe.cookTime}
              onChange={(e) => handleChange("cookTime", e.target.value)}
            />
            <InfoField
              label="Khẩu phần"
              value={recipe.servings}
              onChange={(e) => handleChange("servings", e.target.value)}
            />

            {/* Độ khó chọn từ enum */}
            <div className="info-field">
              <label className="info-label">Độ khó:</label>
              <div className="value-box">
                <select
                  value={recipe.difficulty || ""}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                >
                  <option value="">-- Chọn độ khó --</option>
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Miêu tả món ăn">
          <ContentBox
            content={recipe.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </DetailSection>

        <DetailSection title="Nguyên Liệu">
          <ContentBox
            content={recipe.ingredients?.join("\n") || ""}
            onChange={(e) => handleListChange("ingredients", e.target.value)}
          />
        </DetailSection>

        <DetailSection title="Gia Vị">
          <ContentBox
            content={recipe.spices?.join("\n") || ""}
            onChange={(e) => handleListChange("spices", e.target.value)}
          />
        </DetailSection>

        <DetailSection title="Các bước thực hiện">
          {(recipe.steps || []).map((step, index) => (
            <div key={index} style={{ marginBottom: "20px", border: "1px solid #e2e8f0", padding: "15px", borderRadius: "8px", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                <label style={{ fontWeight: "bold", color: "#334155" }}>Bước {index + 1}:</label>
                <button type="button" onClick={() => removeStep(index)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>Xóa</button>
              </div>
              <CKEditor
                editor={ClassicEditor}
                data={step}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleStepChange(index, data);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addStep} className="action-button edit-btn" style={{ marginTop: "10px" }}>+ Thêm bước</button>
        </DetailSection>

        <DetailSection title="Thông Tin Dinh Dưỡng">
          <ContentBox
            content={recipe.nutritions?.join("\n") || ""}
            onChange={(e) => handleListChange("nutritions", e.target.value)}
          />
        </DetailSection>

        <div className="footer-actions">
          <button
            onClick={handleSave}
            className="action-button edit-btn"
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Các component phụ
const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value, onChange }) => (
  <div className="info-field">
    <label className="info-label">{label}:</label>
    <div className="value-box">
      <input type="text" value={value} onChange={onChange} />
    </div>
  </div>
);

const ContentBox = ({ content, onChange }) => (
  <textarea
    className="content-box"
    value={content}
    onChange={onChange}
  ></textarea>
);

export default RecipeEditPage;