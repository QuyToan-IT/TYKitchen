import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import "./Banner.css";

export default function Banner() {
  const { token } = useAuth(); 
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Lấy danh mục (Bỏ điều kiện check token)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Vẫn gửi token nếu có, không có thì gửi header rỗng
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await fetch("http://localhost:8888/api/v1/categories", {
          headers: headers,
        });
        if (!res.ok) throw new Error("Không thể tải danh mục");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };

    // ✅ SỬA: Luôn gọi hàm này, không cần chờ token
    fetchCategories();
  }, [token]);

  // 2. Lấy công thức mới nhất (Bỏ điều kiện check token)
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const requests = categories.map((cat) =>
          fetch(
            `http://localhost:8888/api/v1/recipes/latest?category=${cat.name}`,
            {
              headers: headers,
            }
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => ({ category: cat.name, recipe: data }))
        );
        
        const results = await Promise.all(requests);
        // Lọc bỏ những kết quả null hoặc rỗng
        const filtered = results.filter((r) => r.recipe);
        setRecipes(filtered);
      } catch (err) {
        console.error("Lỗi khi lấy công thức mới nhất:", err);
      } finally {
        setLoading(false);
      }
    };

    // ✅ SỬA: Chỉ cần có categories là gọi, không cần check token
    if (categories.length > 0) {
        fetchRecipes();
    } else {
        // Nếu không có category nào thì tắt loading để tránh treo
        setLoading(false);
    }
  }, [categories, token]);

  // Tự động chuyển banner mỗi 6 giây
  useEffect(() => {
    if (recipes.length === 0) return; // Chỉ chạy khi có recipes

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [recipes]);

  const nextBanner = () => {
    if (recipes.length > 0) setCurrentIndex((prev) => (prev + 1) % recipes.length);
  };

  const prevBanner = () => {
    if (recipes.length > 0) setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  };

  // Nếu đang loading hoặc không có công thức nào thì không render gì (hoặc render skeleton)
  if (loading) return null; 
  if (recipes.length === 0) return null;

  const { recipe } = recipes[currentIndex];

  return (
    <div className="banner-container">
      {/* Nút trái/phải */}
      <button className="banner-nav banner-nav-left" onClick={prevBanner}>
        <img src="/image/arrow-left.svg" alt="Trái" />
      </button>
      <button className="banner-nav banner-nav-right" onClick={nextBanner}>
        <img src="/image/arrow-right.svg" alt="Phải" />
      </button>

      <div className="banner-content-wrapper">
        <div className="banner-left-content">
          <h1 className="banner-title">{recipe.title}</h1>
          <p className="banner-description">{recipe.description}</p>

          <div className="banner-meta-container">
            <div className="banner-meta-badge">⏱ {recipe.cookTime}</div>
            <div className="banner-meta-badge">📂 {recipe.categoryName}</div>
          </div>

          <div className="banner-author-container">
            <span className="banner-author-name">{recipe.creatorName || "Bếp Của Ty"}</span>
            <span className="banner-author-date">• {recipe.createdAt}</span>
          </div>

          <Link to={`/recipes/${recipe.id}`} className="banner-cta-button">
            Xem Công Thức
          </Link>
        </div>

        <div className="banner-image-wrapper">
          <div className="banner-image-container">
            <img
              className="banner-image"
              src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
              alt={recipe.title}
              onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/image/default-food.png"; // Ảnh backup nếu lỗi
              }}
            />
            <div className="banner-image-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}