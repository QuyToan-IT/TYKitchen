import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./RecipeDetailsPage.css";

const fetchRecipeById = async (id, token) => {
  const response = await fetch(`/api/v1/recipes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Lỗi ${response.status}: Không tìm thấy món ăn`);
  }

  return response.json();
};

const getDifficultyText = (difficulty) => {
  if (difficulty === "Dễ" || difficulty === "EASY") return "Dễ";
  if (difficulty === "Trung bình" || difficulty === "MEDIUM") return "Trung bình";
  if (difficulty === "Khó" || difficulty === "HARD") return "Khó";
  return "Không xác định";
};

const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label className="info-label">{label}:</label>
    <div className="value-box">
      <input type="text" value={value} readOnly />
    </div>
  </div>
);

const ContentBox = ({ content }) => (
  <textarea className="content-box" readOnly value={content}></textarea>
);

const NutritionTable = ({ nutritions }) => (
  <div className="nutrition-grid">
    <div className="nutrition-header">Chỉ số</div>
    <div className="nutrition-header" style={{ textAlign: "right" }}>Giá trị</div>
    {nutritions.map((item, idx) => {
      const [name, value] = item.split(":");
      return (
        <React.Fragment key={idx}>
          <div className="nutrition-label">{name}</div>
          <div className="nutrition-value">{value}</div>
        </React.Fragment>
      );
    })}
  </div>
);

const RecipeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isRejected = location.state?.isRejected;
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecipeDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRecipeById(id, token);
        if (isMounted) setRecipe(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (token) loadRecipeDetails();

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa món "${recipe.title}"?`)) {
      try {
        const res = await fetch(`/api/v1/recipes/${recipe.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Xóa món ăn thất bại");
        alert("Đã xóa món ăn!");
        navigate("/admin/recipes");
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  if (isLoading) return <div className="page-loading">Đang tải chi tiết món ăn...</div>;
  if (error) return (
    <div className="page-error">
      <p>Lỗi: {error}</p>
      <button onClick={() => navigate("/admin/recipes")} className="action-btn">Quay lại</button>
    </div>
  );
  if (!recipe) return <div className="page-error">Không tìm thấy món ăn.</div>;

  return (
    <div className="details-page-wrapper">
      <h1 className="details-main-title">CHI TIẾT MÓN ĂN</h1>

      <div className="dish-image-container">
        <img src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`} alt={recipe.title} />
      </div>

      <div className="detail-container">
        <div className="title-row">
          <InfoField label="Tên món" value={recipe.title} />
          <InfoField label="Danh mục" value={recipe.categoryName || "Chưa phân loại"} />
        </div>

        <DetailSection title="Thông tin chung">
          <div className="time-row">
            <InfoField label="Thời gian nấu" value={recipe.cookTime} />
            <InfoField label="Khẩu phần" value={recipe.servings || "Không rõ"} />
            <InfoField label="Độ khó" value={getDifficultyText(recipe.difficulty)} />
          </div>
        </DetailSection>

        <DetailSection title="Thông Tin Dinh Dưỡng">
          {recipe.nutritions?.length > 0 ? (
            <NutritionTable nutritions={recipe.nutritions} />
          ) : (
            <p>Không có thông tin dinh dưỡng.</p>
          )}
        </DetailSection>

        <DetailSection title="Miêu tả món ăn">
          <ContentBox content={recipe.description || "Không có mô tả."} />
        </DetailSection>

        <DetailSection title="Nguyên Liệu">
          <ContentBox content={recipe.ingredients?.join("\n") || "Không có nguyên liệu"} />
        </DetailSection>

        <DetailSection title="Gia Vị">
          <ContentBox content={recipe.spices?.join("\n") || "Không có gia vị"} />
        </DetailSection>

        <DetailSection title="Các bước thực hiện">
          {recipe.steps?.length > 0 ? (
            recipe.steps.map((step, idx) => (
              <div key={idx} className="step-detail-item">
                <p><strong>Bước {idx + 1}:</strong> {step}</p>
              </div>
            ))
          ) : (
            <p>Không có bước thực hiện</p>
          )}
        </DetailSection>

        <div className="footer-actions">
          {!isRejected && (
            <Link to={`/admin/recipes/edit/${recipe.id}`} className="action-btn edit-btn">
              Chỉnh Sửa
            </Link>
          )}
          <button onClick={handleDelete} className="action-button delete-btn">
            Xóa Món Ăn
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
