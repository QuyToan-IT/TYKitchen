import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Banner from "../components/BannerCarousel";
import { useAuth } from "../hooks/useAuth";
import "./AllRecipes.css";

export default function AllRecipes() {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const search = params.get("search");
  const time = params.get("time");
  const difficulty = params.get("difficulty");
  const sort = params.get("sort") || "desc"; // mặc định: mới nhất

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        let url = "http://localhost:8888/api/v1/recipes";
        const queryParams = [];
        if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
        if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
        if (time) queryParams.push(`time=${encodeURIComponent(time)}`);
        if (difficulty) queryParams.push(`difficulty=${encodeURIComponent(difficulty)}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(url, {
          headers: headers,
        });
        if (!response.ok) throw new Error("Không thể tải món ăn");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu món ăn:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [token, category, search, time, difficulty, sort]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8888/api/v1/categories");
        if (!res.ok) throw new Error("Không thể tải danh mục");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  const currentRecipes = recipes.slice((page - 1) * pageSize, page * pageSize);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const keyword = e.target.value.trim();
      const query = new URLSearchParams(location.search);
      if (keyword) query.set("search", keyword);
      else query.delete("search");
      navigate(`/recipes?${query.toString()}`);
    }
  };
  const toggleFavorite = async (recipeId) => {
  try {
    const res = await fetch(`http://localhost:8888/api/v1/favorites/${recipeId}`, {
      method: favorites.includes(recipeId) ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Không thể cập nhật yêu thích");

    // Cập nhật state favorites
    setFavorites((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  } catch (err) {
    console.error("Lỗi khi cập nhật yêu thích:", err);
  }
};

  return (
    <main style={{ paddingBottom: 40, background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)" }}>
      <Banner />

      <div className="page">
        {/* SEARCH */}
        <section className="search-section">
          <div className="searchbar">
            <img src="/image/kinhlup.png" alt="Tìm kiếm" width={24} height={24} />
            <input
              type="text"
              placeholder="Tìm kiếm công thức yêu thích..."
              aria-label="Tìm kiếm công thức"
              defaultValue={search || ""}
              onKeyDown={handleSearch}
            />
          </div>
        </section>

      {/* FILTER + SORT */}
<section className="filter-section">
  <div
    className="filter-header"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    }}
  >
    <h2 className="filter-title">Lọc Kết Quả</h2>

    <div className="filter-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span className="filter-label-inline">Sắp Xếp Theo:</span>
      <select
        className="filter-select-inline"
        value={sort}
        onChange={(e) => {
          const newSort = e.target.value;
          const query = new URLSearchParams(location.search);
          query.set("sort", newSort);
          navigate(`/recipes?${query.toString()}`);
        }}
      >
        <option value="desc">Mới Nhất</option>
        <option value="asc">Cũ Nhất</option>
      </select>
    </div>
  </div>

  <div className="filters">
    {/* Loại Món */}
    <div className="filter-row">
      <span className="filter-label-inline">Loại Món:</span>
      <select
        className="filter-select-inline"
        value={category || ""}
        onChange={(e) => {
          const newCategory = e.target.value;
          const query = new URLSearchParams(location.search);
          if (newCategory) query.set("category", newCategory);
          else query.delete("category");
          navigate(`/recipes?${query.toString()}`);
        }}
      >
        <option value="">Tất cả</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>

    {/* Thời Gian */}
    <div className="filter-row">
      <span className="filter-label-inline">Thời Gian:</span>
      <select
        className="filter-select-inline"
        value={time || ""}
        onChange={(e) => {
          const newTime = e.target.value;
          const query = new URLSearchParams(location.search);
          if (newTime) query.set("time", newTime);
          else query.delete("time");
          navigate(`/recipes?${query.toString()}`);
        }}
      >
        <option value="">Tất cả</option>
        <option value="short">Dưới 30 phút</option>
        <option value="medium">30–60 phút</option>
        <option value="long">Trên 60 phút</option>
      </select>
    </div>

    {/* Độ Khó */}
    <div className="filter-row">
      <span className="filter-label-inline">Độ Khó:</span>
      <select
        className="filter-select-inline"
        value={difficulty || ""}
        onChange={(e) => {
          const newDiff = e.target.value;
          const query = new URLSearchParams(location.search);
          if (newDiff) query.set("difficulty", newDiff);
          else query.delete("difficulty");
          navigate(`/recipes?${query.toString()}`);
        }}
      >
        <option value="">Tất cả</option>
        <option value="Dễ">Dễ</option>
        <option value="Trung bình">Trung bình</option>
        <option value="Khó">Khó</option>
      </select>
    </div>
  </div>
</section>


        {/* TITLE + SUB */}
        <div className="section-head">
          <h1 className="section-title">
            {category
              ? `Công Thức - ${category}`
              : search
              ? `Kết quả tìm kiếm cho "${search}"`
              : "Tất Cả Món Ăn"}
          </h1>
          <p className="section-sub">
            Hiển thị {currentRecipes.length} trên {recipes.length} kết quả
          </p>
        </div>

        {/* GRID CARDS */}
        <section className="grid">
          {loading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="error-message">Lỗi: {error}</div>
          ) : currentRecipes.length === 0 ? (
            <div className="empty-message">Chưa có món ăn nào.</div>
          ) : (
            currentRecipes.map((recipe) => (
              <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="card">
               <div
  className="card-like"
  onClick={(e) => {
    e.preventDefault(); // tránh click vào Link
    toggleFavorite(recipe.id);
  }}
>
  <img
    src={
      favorites.includes(recipe.id)
        ? "/image/traitim.png"
        : "/image/traitimtrang.png"
    }
    alt="Yêu thích"
    width={22}
    height={22}
  />
</div>
                <div className="card-img-wrapper">
                  <img
                    className="card-img"
                    src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
                    alt={recipe.title}
                    loading="lazy"
                  />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{recipe.title}</h3>
                  <div className="card-meta">
                    <img
                      src="/image/time.png"
                      alt="Thời gian"
                      className="card-meta-icon"
                    />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="card-meta">
                    <span>{recipe.categoryName}</span>
                  </div>
                  <div className="card-meta">
                    <img
                      src="/image/user.png"
                      alt="Người đăng"
                      className="card-meta-icon"
                    />
                    <span>{recipe.creatorName || "Không rõ"}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>

        {/* PAGINATION */}
        <nav className="pagination" aria-label="Phân trang">
          {Array.from({ length: Math.ceil(recipes.length / pageSize) }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${page === i + 1 ? "active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <section className="cta">
          <div className="cta-content">
            <h2 className="cta-title">
              Ai cũng có thể là đầu bếp trong căn bếp của riêng
            </h2>
            <p className="cta-desc">
              Hãy để "Bếp của Ty" giúp bạn khám phá niềm đam mê ẩm thực với những công thức
              đơn giản, dễ thực hiện và cực kỳ ngon miệng!
            </p>
            <button className="cta-btn">Tìm Hiểu Thêm</button>
          </div>
          <div className="cta-card">
            <img
              className="cta-img"
              src="/image/about_us.png"
              alt="About us"
              loading="lazy"
            />
          </div>
        </section>

        {/* SUBSCRIBE */}
        <section className="subscribe">
          <div className="subscribe-content">
            <h2 className="subscribe-title">Món Ngon Đến Hộp Thư Của Bạn</h2>
            <p className="subscribe-sub">
              Đăng ký ngay để không bỏ lỡ những công thức nấu ăn mới, mẹo vặt nhà bếp và ưu đãi đặc biệt từ "Bếp của Ty".
            </p>
            <div className="subscribe-row">
              <div className="subscribe-input">
                <input type="email" placeholder="Địa chỉ email của bạn..." />
              </div>
              <button className="subscribe-btn">Đăng Ký</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
