import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Banner from "../components/BannerCarousel";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import "./Home.css";

export default function Home() {


    const [categories, setCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { token } = useAuth();
    const navigate = useNavigate();

    // Lấy danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/v1/categories");
                if (!response.ok) throw new Error("Không thể tải danh mục");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Lấy công thức (CHỈ LẤY CÁC BÀI ĐÃ ACCEPTED nhờ Backend Filter)
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // Thêm header Authorization chỉ khi token có sẵn
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const response = await fetch("/api/v1/recipes", {
                    headers: headers,
                });
                
                if (!response.ok) throw new Error("Không thể tải công thức nấu ăn");
                
                const data = await response.json();
                // Backend đã filter status=ACCEPTED, giờ chỉ cần lấy 12 bài đầu
                setRecipes(data.slice(0, 12)); 
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu công thức:", error);
            }
        };
        
        // Chạy fetch ngay lập tức. Dependency [token] giúp fetch lại khi người dùng đăng nhập/đăng xuất
        fetchRecipes(); 
    }, [token]);

    // Xử lý yêu thích
    // Xử lý yêu thích
const toggleFavorite = async (recipeId) => {
  console.log("🔎 Token hiện tại:", token);

  if (!token) {
    alert("Bạn cần đăng nhập để sử dụng tính năng yêu thích!");
    navigate("/login");
    return;
  }

  const originalRecipes = [...recipes];
  const recipeToUpdate = originalRecipes.find(r => r.id === recipeId);
  if (!recipeToUpdate) return;

  const isCurrentlyFavorite = recipeToUpdate.isFavorited;

  // 1. Cập nhật giao diện ngay lập tức (Optimistic Update)
  setRecipes(currentRecipes =>
    currentRecipes.map(r =>
      r.id === recipeId ? { ...r, isFavorited: !isCurrentlyFavorite } : r
    )
  );

  try {
    // 2. Giải mã userId từ token
    const decoded = jwtDecode(token);
    const userId = decoded?.userId;

    // 3. Gọi API để đồng bộ với backend
    const method = isCurrentlyFavorite ? "DELETE" : "POST";
    const apiUrl = `http://localhost:8888/api/v1/favorites/${recipeId}`;

    const response = await fetch(apiUrl, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-user-id": userId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API favorites thất bại:", response.status, errorText);
      throw new Error(`Yêu cầu thất bại với status ${response.status}`);
    }

    console.log("✅ Cập nhật yêu thích thành công cho recipe:", recipeId);

  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật yêu thích, đang hoàn tác giao diện:", error);
    // 4. Nếu API thất bại, hoàn tác lại thay đổi trên giao diện
    setRecipes(originalRecipes);
    alert("Đã có lỗi xảy ra, không thể cập nhật trạng thái yêu thích. Vui lòng thử lại.");
  }
};

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        if (e.key === "Enter" && searchTerm.trim() !== "") {
            navigate(`/recipes?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <main className="home-page">

        {/* BANNER */}
            <Banner />

            <div className="home-container">
            {/* CATEGORIES SECTION */}
            <section className="categories-section">
                <div className="section-header">
                <h2 className="section-title">Danh Mục</h2>
                <Link to="/recipes" className="view-all-btn">
                    Hiển thị tất cả
                </Link>
                </div>
                <div className="categories-grid">
                {categories.map((category) => (
                    <Link
                    key={category.id}
                    to={`/recipes?category=${category.name}`}
                    className="category-card"
                    >
                    <span className="category-name">{category.name}</span>
                    </Link>
                ))}
                </div>
            </section>

            {/* SEARCH SECTION */}
            <section className="search-section">
                <div className="searchbar">
                <img src="/image/kinhlup.png" alt="Tìm kiếm" width={28} height={28} />
                <input
                    type="text"
                    placeholder="Tìm kiếm công thức..."
                    aria-label="Tìm kiếm công thức"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
                </div>
            </section>

            {/* RECIPES SECTION */}
            <section className="recipes-section">
                <div className="recipes-header">
                <h2 className="recipes-title">Công Thức Đơn Giản & Thơm Ngon</h2>
                <p className="recipes-subtitle">
                    Khám phá bộ sưu tập công thức nấu ăn dễ làm, nhanh chóng, giúp bạn tạo
                    ra những bữa ăn tuyệt vời mỗi ngày!
                </p>
                </div>
                <div className="recipes-grid">
                {recipes.map((recipe) => (
                    <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-card">
                    <div
                        className="recipe-like"
                        onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(recipe.id);
                        }}
                    >
                        <img
                        src={
                            recipe.isFavorited
                                ? "/image/traitim.png" // tym đỏ
                                : "/image/traitimtrang.png" // tym trắng
                        }
                        alt="Yêu thích"
                        width={22}
                        height={22}
                        />
                    </div>
                    <div className="recipe-img-wrapper">
                        <img
                        className="recipe-img"
                        // SỬA: Sử dụng đường dẫn tương đối qua Gateway
                        src={`http://localhost:8888/uploads/recipe/${recipe.mainImageUrl}`}
                        alt={recipe.title}
                        loading="lazy"
                        />
                    </div>
                    <div className="recipe-body">
                        <h3 className="recipe-title">{recipe.title}</h3>
                        <div className="recipe-meta">
                        <img src="/image/time.png" alt="Thời gian" width={16} height={16} />
                        <span>{recipe.cookTime}</span>
                        </div>
                        <div className="recipe-meta">
                        <span>{recipe.categoryName}</span>
                        </div>
                        <div className="recipe-meta">
                        <img src="/image/user.png" alt="Người đăng" width={16} height={16} />
                        <span>{recipe.creatorName}</span>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <div className="cta-content">
                <h2 className="cta-title">Ai cũng có thể là đầu bếp trong căn bếp của riêng mình</h2>
                <p className="cta-desc">
                    Hãy để "Bếp của Ty" giúp bạn khám phá niềm đam mê ẩm thực với những
                    công thức đơn giản, dễ thực hiện và cực kỳ ngon miệng!
                </p>
                <Link to="/about" className="cta-btn">
                    Tìm Hiểu Thêm
                </Link>
                </div>
                <div className="cta-image-wrapper">
                <img className="cta-img" src="/image/about_us.png" alt="About us" loading="lazy" />
                </div>
            </section>

            {/* SUBSCRIBE SECTION */}
            <section className="subscribe-section">
                <div className="subscribe-content">
                <h2 className="subscribe-title">Món Ngon Đến Hộp Thư Của Bạn</h2>
                <p className="subscribe-subtitle">
                    Đăng ký ngay để không bỏ lỡ những công thức nấu ăn mới, mẹo vặt nhà bếp
                    và ưu đãi đặc biệt từ "Bếp của Ty".
                </p>
                <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="subscribe-input">
                    <input type="email" placeholder="Địa chỉ email của bạn..." />
                    </div>
                    <button type="submit" className="subscribe-btn">
                    Đăng Ký
                    </button>
                </form>
                </div>
            </section>
            </div>
        </main>
    );
}
