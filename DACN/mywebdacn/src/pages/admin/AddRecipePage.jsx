import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AddRecipePage.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [recipeData, setRecipeData] = useState({
    title: "",
    description: "",
    cookTime: "",
    servings: "",
    difficulty: "EASY",
    categoryId: "",
    ingredients: "",
    spices: "",
    steps: [{ instruction: "", imageFile: null, imagePreview: null }],
    nutritions: [
      { name: "Calories", value: "" },
      { name: "Fat", value: "" },
      { name: "Protein", value: "" },
      { name: "Carbs", value: "" },
      { name: "Cholesterol", value: "" },
    ],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/v1/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải danh mục");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setRecipeData((prev) => ({ ...prev, categoryId: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStepChange = (idx, value) => {
    const newSteps = [...recipeData.steps];
    newSteps[idx].instruction = value;
    setRecipeData((prev) => ({ ...prev, steps: newSteps }));
  };


  const addStep = () => {
    setRecipeData((prev) => ({
      ...prev,
      steps: [...prev.steps, { instruction: "", imageFile: null, imagePreview: null }],
    }));
  };

  const removeStep = (idx) => {
    const newSteps = recipeData.steps.filter((_, i) => i !== idx);
    setRecipeData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleNutritionChange = (idx, value) => {
    const newNutritions = [...recipeData.nutritions];
    newNutritions[idx].value = value;
    setRecipeData((prev) => ({ ...prev, nutritions: newNutritions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Vui lòng chọn ảnh đại diện món ăn.");
      return;
    }

    // Payload đúng với RecipeDTO
    const payload = {
      title: recipeData.title,
      description: recipeData.description,
      cookTime: recipeData.cookTime,
      servings: recipeData.servings,
      difficulty: recipeData.difficulty,
      userId: user.id,
      categoryId: Number(recipeData.categoryId),
      ingredients: recipeData.ingredients.split("\n").filter((v) => v.trim() !== ""),
      spices: recipeData.spices.split("\n").filter((v) => v.trim() !== ""),
      steps: recipeData.steps.map((s) => s.instruction),
      nutritions: recipeData.nutritions.map((n) => `${n.name}:${n.value}`),
    };

    const formData = new FormData();
    formData.append("mainImage", imageFile);

    recipeData.steps.forEach((s) => {
      if (s.imageFile) {
        formData.append("otherImages", s.imageFile);
      }
    });

    formData.append("dto", new Blob([JSON.stringify(payload)], { type: "application/json" }));

    try {
      const res = await fetch("/api/v1/recipes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Thêm món ăn thành công!");
      navigate("/admin/recipes");
    } catch (err) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    }
  };
return (
  <div className="add-recipe-wrapper">
    <h1 className="add-recipe-main-title">THÊM MÓN ĂN MỚI</h1>

    <div className="image-upload-area" onClick={() => fileInputRef.current.click()}>
      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
      {imagePreview ? (
        <img src={imagePreview} alt="Xem trước" className="image-preview" />
      ) : (
        <span>Chọn ảnh đại diện</span>
      )}
    </div>

    <form className="detail-form-container" onSubmit={handleSubmit}>
      {/* Các field cơ bản */}
      <div className="form-field">
        <label>Tên món:</label>
        <input type="text" name="title" value={recipeData.title} onChange={handleChange} required />
      </div>

      <div className="form-field">
        <label>Danh mục:</label>
        <select value={recipeData.categoryId} onChange={handleCategoryChange} required>
          <option value="" disabled>Chọn danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Thời gian nấu:</label>
        <input type="text" name="cookTime" value={recipeData.cookTime} onChange={handleChange} />
      </div>

      <div className="form-field">
        <label>Phục vụ (số người):</label>
        <input type="text" name="servings" value={recipeData.servings} onChange={handleChange} />
      </div>

      <div className="form-field">
        <label>Mức độ khó:</label>
        <select name="difficulty" value={recipeData.difficulty} onChange={handleChange}>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>
      </div>

      <div className="form-field">
        <label>Mô tả:</label>
        <textarea name="description" value={recipeData.description} onChange={handleChange} />
      </div>

      <div className="form-field">
        <label>Nguyên liệu:</label>
        <textarea name="ingredients" value={recipeData.ingredients} onChange={handleChange} placeholder="Mỗi nguyên liệu 1 dòng" />
      </div>

      <div className="form-field">
        <label>Gia vị:</label>
        <textarea name="spices" value={recipeData.spices} onChange={handleChange} placeholder="Mỗi gia vị 1 dòng" />
      </div>

      {/* Các bước thực hiện */}
      <div className="steps-section">
        <h2>Các bước thực hiện:</h2>
        {recipeData.steps.map((step, idx) => (
          <div key={idx} className="step-item">
            <label>Bước {idx + 1}:</label>
            <CKEditor
              editor={ClassicEditor}
              data={step.instruction}
              onChange={(event, editor) => {
                const data = editor.getData();
                handleStepChange(idx, data);
              }}
            />
            <div className="right-controls">
              <button type="button" onClick={() => removeStep(idx)}>Xóa bước</button>
            </div>
            {step.imagePreview && (
              <img src={step.imagePreview} alt={`Step ${idx + 1}`} className="step-image-preview" />
            )}
          </div>
        ))}
        <button type="button" onClick={addStep}>+ Thêm bước</button>
      </div>

        <div className="nutrition-section">
          <h2>Thông tin dinh dưỡng:</h2>
          {recipeData.nutritions.map((n, idx) => (
            <div className="form-field" key={n.name}>
              <label>{n.name}:</label>
              <input type="text" value={n.value} onChange={(e) => handleNutritionChange(idx, e.target.value)} placeholder="vd: 50 kcal" />
            </div>
          ))}
        </div>

        <div className="form-footer-actions">
          <button type="button" onClick={() => navigate("/admin/recipes")}>Hủy</button>
          <button type="submit">Lưu món ăn</button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipePage;
