import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./RecipesPage.css";

const FilterDropdown = ({ label, options, value, onChange }) => (
  <div className="filter-item">
    <span>{label}</span>
    <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Chọn {label} --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const RecipeRow = ({ recipe, token, onRecipeDeleted }) => {
  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa món "${recipe.title}"?`)) {
      try {
        const res = await fetch(`http://localhost:8888/api/v1/recipes/${recipe.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Xóa món ăn thất bại");
        alert(`Đã xóa món: ${recipe.title}`);
        onRecipeDeleted(recipe.id);
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <div className="data-table-grid table-row">
      <div className="cell-image-wrapper">
        <img
          src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
          alt={recipe.title}
          className="recipe-image"
        />
      </div>
      <span className="cell-text">{recipe.title}</span>
      <span className="cell-text">{recipe.categoryName || "Chưa phân loại"}</span>
      <span className="cell-text">{recipe.creatorName || "Không rõ"}</span>
      <div className="cell-actions">
        <Link to={`/admin/recipes/details/${recipe.id}`} className="action-btn">Chi Tiết</Link>
        <button onClick={handleDelete} className="action-btn btn-delete">Xóa</button>
      </div>
    </div>
  );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span className="page-arrow" onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}>&lsaquo;</span>
      {Array.from({ length: totalPages }, (_, i) => (
        <div
          key={i + 1}
          className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </div>
      ))}
      <span className="page-arrow" onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}>&rsaquo;</span>
    </div>
  );
};

const RecipesPage = () => {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const difficulties = [
    { value: "Dễ", label: "Dễ" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Khó", label: "Khó" },
  ];

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      const response = await fetch(`http://localhost:8888/api/v1/recipes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Không thể tải danh sách món ăn.");
      const data = await response.json();
      setRecipes(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi khi tải recipes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8888/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh mục.");
      const data = await res.json();
      setCategories(data.map((c) => ({ value: c.name, label: c.name })));
    } catch (err) {
      console.error("Lỗi tải categories:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchRecipes();
    }
  }, [token, searchTerm, selectedCategory, selectedDifficulty]);

  const handleRecipeDeleted = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRecipes = recipes.slice(indexOfFirst, indexOfLast);

  if (error) return <div className="recipes-page-container error-message">Lỗi: {error}</div>;

  return (
    <div className="recipes-page-container">
      <h1 className="page-title">QUẢN LÝ MÓN ĂN</h1>

      <div className="top-controls">
        <div className="search-box">
          <img src="/image/kinhlup.png" alt="Tìm kiếm" className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRecipes()}
          />
        </div>
        <Link to="/admin/recipes/add" className="add-button">+</Link>
      </div>

      <div className="filter-row">
        <span className="filter-label">Lọc Theo:</span>
        <FilterDropdown label="Loại Món" options={categories} value={selectedCategory} onChange={setSelectedCategory} />
        <FilterDropdown label="Độ Khó" options={difficulties} value={selectedDifficulty} onChange={setSelectedDifficulty} />
      </div>

      <div className="data-table-container">
        <div className="data-table-grid table-header">
          <span>HÌNH ẢNH</span>
          <span>TÊN MÓN</span>
          <span>DANH MỤC</span>
          <span>NGƯỜI TẠO</span>
          <span style={{ textAlign: "center" }}>CHỨC NĂNG</span>
        </div>

        {loading ? (
          <div className="loading-message">Đang tải danh sách món ăn...</div>
        ) : currentRecipes.length === 0 ? (
          <div className="loading-message">Không tìm thấy món ăn phù hợp.</div>
        ) : (
          currentRecipes.map((recipe) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              token={token}
              onRecipeDeleted={handleRecipeDeleted}
            />
          ))
        )}
      </div>
      <Pagination
        totalItems={recipes.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default RecipesPage;
