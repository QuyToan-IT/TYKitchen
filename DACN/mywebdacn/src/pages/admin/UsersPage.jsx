import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./UsersPage.css";

// --- Định dạng thời gian theo giờ Việt Nam ---
const formatLoginTimeVN = (dateString) => {
  if (!dateString) return "Chưa có";
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const options = isToday
    ? {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      }
    : {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      };

  const formatter = new Intl.DateTimeFormat("vi-VN", options);

  return isToday ? `Hôm nay lúc ${formatter.format(date)}` : formatter.format(date);
};

// --- Component hiển thị danh sách món ăn với phân trang ---
const RecipeList = ({ recipes }) => {
  const [recipePage, setRecipePage] = useState(1);
  const recipesPerPage = 15;

  const indexOfLast = recipePage * recipesPerPage;
  const indexOfFirst = indexOfLast - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  // Tính số trang để hiển thị (tối đa 5 trang gần trang hiện tại)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, recipePage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div>
      <ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc" }}>
        {currentRecipes.map((r) => (
          <li key={r.id} style={{ margin: "6px 0", color: "#000000", fontWeight: 500 }}>
            {r.title}
          </li>
        ))}
      </ul>

      {/* Phân trang cho danh sách món */}
      {totalPages > 1 && (
        <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "flex-start", alignItems: "center" }}>
          <button
            onClick={() => setRecipePage((p) => Math.max(p - 1, 1))}
            disabled={recipePage === 1}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              background: recipePage === 1 ? "#f0f0f0" : "#fff",
              cursor: recipePage === 1 ? "not-allowed" : "pointer",
              fontSize: 12,
            }}
          >
            &lsaquo; Trước
          </button>

          {/* Hiển thị số trang (tối đa 5) */}
          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span key={idx} style={{ fontSize: 12, color: "#666" }}>...</span>
            ) : (
              <button
                key={idx}
                onClick={() => setRecipePage(page)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: recipePage === page ? "1px solid #3B82F6" : "1px solid #ddd",
                  background: recipePage === page ? "#3B82F6" : "#fff",
                  color: recipePage === page ? "#fff" : "#000",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: recipePage === page ? 600 : 400,
                }}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setRecipePage((p) => Math.min(p + 1, totalPages))}
            disabled={recipePage === totalPages}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              background: recipePage === totalPages ? "#f0f0f0" : "#fff",
              cursor: recipePage === totalPages ? "not-allowed" : "pointer",
              fontSize: 12,
            }}
          >
            Sau &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
};

// --- Component hiển thị từng người dùng ---
const UserRow = ({ user, index, onDelete }) => {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) return;

    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());

      alert(`Đã xóa thành công người dùng: ${user.fullName}`);
      onDelete(user.id);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <>
      <div className="user-data-grid table-row">
        <span>{index + 1}</span>
        <span className="user-name">{user.fullName}</span>
        <span>{user.email}</span>
        <span>{formatLoginTimeVN(user.lastLoginAt)}</span>
        <span className="post-count">{user.postCount || 0}</span>
        <div className="action-btn-group">
          <button
            onClick={() => setExpanded((s) => !s)}
            className="action-btn"
            style={{ marginRight: 8 }}
          >
            {expanded ? "Ẩn" : "Xem"}
          </button>
          <button onClick={handleDelete} className="action-btn btn-delete">Xóa</button>
        </div>
      </div>

      {/* Panel hiển thị danh sách món của user (nằm dưới hàng) */}
      {expanded && (
        <div className="user-recipes-panel" style={{ padding: "10px 28px 18px", background: "#fff", borderBottom: "1px solid #f3f4f6" }}>
          {Array.isArray(user.recipes) && user.recipes.length > 0 ? (
            <RecipeList recipes={user.recipes} />
          ) : (
            <p style={{ color: "#ef4444", fontWeight: 500 }}>
              Chưa có món ăn nào được đăng. 
              {user.postCount > 0 && ` Postcount = ${user.postCount} nhưng recipes trống.`}
            </p>
          )}
        </div>
      )}
    </>
  );
};

// --- Component phân trang ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  // Tính số trang để hiển thị (tối đa 5 trang gần trang hiện tại)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <span className="page-arrow" onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}>&lsaquo;</span>
      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="page-ellipsis">...</span>
        ) : (
          <div
            key={idx}
            className={`page-number ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </div>
        )
      )}
      <span className="page-arrow" onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}>&rsaquo;</span>
    </div>
  );
};

// --- Component chính ---
const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();

        // --- LẤY MẢNG recipes CHO TỪNG USER (gán user.recipes và user.postCount) ---
        const usersWithRecipes = await Promise.all(
          data.map(async (u) => {
            try {
              const r = await fetch(
                `http://localhost:8888/api/v1/recipes?creator=${u.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              console.log(`🔍 User ${u.id} (${u.fullName}) - API recipes status:`, r.status);
              
              if (!r.ok) {
                console.warn(`⚠️ Không thể tải recipes cho user ${u.id}: ${r.status}`);
                return { ...u, postCount: 0, recipes: [] };
              }
              
              const recipes = await r.json();
              console.log(`📦 Raw recipes từ API cho user ${u.id}:`, recipes.length, "items");
              
              // ⚠️ FIX: Nếu API trả về tất cả recipes (không filter by creator),
              // thì filter ở frontend bằng cách so sánh userId/creatorId
              let userRecipes = Array.isArray(recipes) ? recipes : [];
              
              // Kiểm tra xem recipes có creatorId hay userId field chứa ID của creator
              if (userRecipes.length > 0 && userRecipes[0].userId) {
                // Nếu có userId, lọc chỉ những recipe của user hiện tại
                userRecipes = userRecipes.filter(r => r.userId === u.id);
                console.log(`✅ Sau khi filter by userId: ${userRecipes.length} recipes của user ${u.id}`);
              }
              
              return { ...u, postCount: userRecipes.length, recipes: userRecipes };
            } catch (err) {
              console.debug("Lỗi khi lấy recipes cho user", u.id, err);
              return { ...u, postCount: 0, recipes: [] };
            }
          })
        );

        setUsers(usersWithRecipes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleDeleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tổng số món ăn đã đăng (toàn bộ users) và theo bộ lọc (hiện tại)
  const totalPostsAll = users.reduce((sum, u) => sum + (u.postCount || 0), 0);
  const totalPostsFiltered = filteredUsers.reduce((sum, u) => sum + (u.postCount || 0), 0);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="users-page-container">
      <h1 className="page-title">QUẢN LÝ NGƯỜI DÙNG</h1>

      <div className="top-controls">
        <div className="search-box">
          <img src="/image/kinhlup.png" alt="Tìm kiếm" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Hiển thị tổng số món ăn: toàn bộ và theo bộ lọc */}
        <div className="total-posts" style={{ marginLeft: 16, color: "#1f2937", fontWeight: 600 }}>
          Tổng món đã đăng: {totalPostsFiltered} {filteredUsers.length !== users.length ? ` / ${totalPostsAll}` : ""}
        </div>
      </div>

      <div className="data-table-container">
        <div className="user-data-grid table-header">
          <span>STT</span>
          <span>Họ Tên</span>
          <span>Email</span>
          <span>Lần đăng nhập cuối</span>
          <span style={{ textAlign: "center" }}>Món ăn đã đăng</span>
          <span style={{ textAlign: "center" }}>Chức năng</span>
        </div>

        {loading ? (
          <div className="loading-message">Đang tải danh sách người dùng...</div>
        ) : error ? (
          <div className="error-message">Lỗi: {error}</div>
        ) : currentUsers.length === 0 ? (
          <div className="loading-message">Không có người dùng nào.</div>
        ) : (
          currentUsers.map((user, idx) => (
            <UserRow
              key={user.id}
              user={user}
              index={indexOfFirst + idx}
              onDelete={handleDeleteUser}
            />
          ))
        )}
      </div>

      <Pagination
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default UsersPage;
