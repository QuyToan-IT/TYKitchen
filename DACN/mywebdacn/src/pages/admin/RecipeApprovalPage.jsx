import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./RecipeApprovalPage.css";

// --- Modal Component để nhập lý do từ chối ---
const RejectionModal = ({ isOpen, onClose, onSubmit, recipeTitle }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    } else {
      alert("Vui lòng nhập lý do từ chối.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lý do từ chối món "{recipeTitle}"</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows="4"
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="action-btn btn-detail" onClick={onClose}>Hủy</button>
            <button type="submit" className="action-btn btn-reject">Xác nhận Từ chối</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ApprovalRow Component - Xử lý cả PENDING và REJECTED ---
const ApprovalRow = ({ recipe, token, onAction, isRejected, isApproved }) => {
  const updateStatus = async (newStatus, reason = null) => {
      try {
        const res = await fetch(`http://localhost:8888/api/v1/moderation/${recipe.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus, reason: reason }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Thao tác thất bại");
        }

        alert(`Đã ${newStatus === 'APPROVED' ? "duyệt" : "từ chối"} món: ${recipe.title}`);
        onAction(newStatus, recipe); // ✅ Gửi cả trạng thái mới và toàn bộ object recipe
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    };

  const handleApprove = () => {
    if (window.confirm(`Bạn có chắc chắn muốn DUYỆT món ăn "${recipe.title}"?`)) {
      updateStatus("APPROVED");
    }
  };

  const handleReject = () => {
    onAction('open_reject_modal', recipe);
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA món ăn "${recipe.title}"?`)) {
      try {
        const res = await fetch(`http://localhost:8888/api/v1/recipes/${recipe.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Xóa thất bại");
        alert(`Đã xóa món: ${recipe.title}`);
        onAction('DELETED', recipe); // ✅ Gửi action 'DELETED' để phân biệt
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <div className="table-row data-row">
      <div className="cell-content">{recipe.title}</div>
      <div className="cell-content">{recipe.creatorName || "Không rõ"}</div>
      <div className="cell-content">{recipe.createdAt}</div>
      <div className="cell-content">{recipe.categoryName}</div>
      {isRejected && <div className="cell-content">{recipe.rejectionReason || "Không có lý do"}</div>}
      <div className="action-group">
        {!isRejected && !isApproved ? (
          <>
            <Link to={`/admin/recipes/details/${recipe.id}`} className="action-btn btn-detail">Chi Tiết</Link>
            <button onClick={handleApprove} className="action-btn btn-approve">Duyệt</button>
            <button onClick={handleReject} className="action-btn btn-reject">Từ chối</button>
            <button onClick={handleDelete} className="action-btn btn-delete">Xóa</button>
          </>
        ) : isApproved ? (
          <>
            <Link to={`/admin/recipes/details/${recipe.id}`} className="action-btn btn-detail">Chi Tiết</Link>
            <button onClick={handleReject} className="action-btn btn-reject">Từ chối</button>
            <button onClick={handleDelete} className="action-btn btn-delete">Xóa</button>
          </>
        ) : (
          <>
            <Link to={`/admin/recipes/details/${recipe.id}`} state={{ isRejected: true }} className="action-btn btn-detail">Chi Tiết</Link>
            <button onClick={handleDelete} className="action-btn btn-delete">Xóa</button>
          </>
        )}
       </div>
     </div>
   );
};

const Pagination = () => (
  <div className="pagination">
    <a href="#" className="page-link active">1</a>
    <a href="#" className="page-link">2</a>
    <a href="#" className="page-link">3</a>
    <span className="page-link">...</span>
    <a href="#" className="page-link">»</a>
  </div>
);

// --- Component chính ---
const RecipeApprovalPage = () => {
  const { token } = useAuth();
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [approvedRecipes, setApprovedRecipes] = useState([]);
  const [rejectedRecipes, setRejectedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending | rejected
  
  // State cho modal từ chối
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Fetch cả PENDING, APPROVED, và REJECTED recipes
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch("http://localhost:8888/api/v1/moderation?status=PENDING", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8888/api/v1/moderation?status=APPROVED", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8888/api/v1/moderation?status=REJECTED", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!pendingRes.ok) {
          throw new Error("Không thể tải danh sách chờ duyệt.");
        }
        if (!approvedRes.ok) {
            throw new Error("Không thể tải danh sách đã duyệt.");
        }
        if (!rejectedRes.ok) {
          throw new Error("Không thể tải danh sách đã từ chối.");
         }
        
        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();
        
        setPendingRecipes(pendingData || []);
        setApprovedRecipes(approvedData || []); // Tải danh sách đã duyệt từ API
        setRejectedRecipes(rejectedData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [token]);

  // ✅ Cập nhật logic xử lý action
  const handleAction = (action, recipe) => {
    if (action === 'open_reject_modal') {
      setSelectedRecipe(recipe);
      setIsModalOpen(true);
    } else if (action === 'APPROVED') {
      // Khi duyệt, xóa khỏi pending
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setApprovedRecipes(prev => [recipe, ...prev]);
    } else if (action === 'DELETED') {
      // Khi xóa, xóa khỏi cả 2 danh sách
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setApprovedRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setRejectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else {
      // Mặc định là xóa khỏi pending (trường hợp cũ)
      setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleModalSubmit = async (reason) => {
    if (!selectedRecipe) return;
    
    try {
      const res = await fetch(`http://localhost:8888/api/v1/moderation/${selectedRecipe.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "REJECTED", reason: reason }),
      });
      if (!res.ok) throw new Error(await res.text() || "Thao tác thất bại");
      alert(`Đã từ chối món: ${selectedRecipe.title}`);
      // Xóa khỏi PENDING và thêm vào REJECTED
      setPendingRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
      setApprovedRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
      // Thêm lý do vào object trước khi đẩy vào state rejected
      setRejectedRecipes(prev => [{ ...selectedRecipe, rejectionReason: reason }, ...prev]);
       handleModalClose();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="approval-page-container">
      <h1 className="page-title">DUYỆT BÀI MÓN ĂN</h1>

      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* TAB NAVIGATION - GỌN HƠN, TRÊN 1 DÒNG */}
      <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "2px solid #e6eff5" }}>
        <div
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "pending" ? 600 : 400,
            color: activeTab === "pending" ? "#3B82F6" : "#999",
            borderBottom: activeTab === "pending" ? "2px solid #3B82F6" : "none",
            marginBottom: activeTab === "pending" ? "-2px" : "0",
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          Chờ duyệt ({pendingRecipes.length})
        </div>
        <div
          onClick={() => setActiveTab("approved")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "approved" ? 600 : 400,
            color: activeTab === "approved" ? "#3B82F6" : "#999",
            borderBottom: activeTab === "approved" ? "2px solid #3B82F6" : "none",
            marginBottom: activeTab === "approved" ? "-2px" : "0",
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          Đã duyệt ({approvedRecipes.length})
        </div>
        <div
          onClick={() => setActiveTab("rejected")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "rejected" ? 600 : 400,
            color: activeTab === "rejected" ? "#3B82F6" : "#999",
            borderBottom: activeTab === "rejected" ? "2px solid #3B82F6" : "none",
            marginBottom: activeTab === "rejected" ? "-2px" : "0",
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          Đã từ chối ({rejectedRecipes.length})
        </div>
      </div>

      <div className="approval-table">
        {/* Header của bảng */}
        <div className="table-row table-header">
          <div>Tên món</div>
          <div>Tác giả</div>
          <div>Ngày đăng</div>
          <div>Danh mục</div>
          {activeTab === "rejected" && <div>Lý do</div>}
          <div style={{ textAlign: "right" }}>Chức năng</div>
        </div>

        {/* Các hàng dữ liệu */}
        {loading ? (
          <div className="loading-message">Đang tải danh sách...</div>
        ) : activeTab === "pending" && pendingRecipes.length === 0 ? (
          <div className="loading-message">Không có món ăn nào đang chờ duyệt.</div>
        ) : activeTab === "approved" && approvedRecipes.length === 0 ? (
          <div className="loading-message">Chưa có món ăn nào được duyệt.</div>
        ) : activeTab === "rejected" && rejectedRecipes.length === 0 ? (
          <div className="loading-message">Không có món ăn nào bị từ chối.</div>
         ) : (
          (activeTab === "pending" ? pendingRecipes : activeTab === "approved" ? approvedRecipes : rejectedRecipes).map((recipe) => (
             <ApprovalRow 
               key={recipe.id} 
               recipe={recipe}
               token={token} 
               onAction={handleAction}
              isRejected={activeTab === "rejected"}
              isApproved={activeTab === "approved"}
             />
           ))
         )}
      </div>

      {/* Pagination */}
      {(activeTab === "pending" ? pendingRecipes : activeTab === "approved" ? approvedRecipes : rejectedRecipes).length > 10 && (
        <Pagination />
      )}

      <RejectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        recipeTitle={selectedRecipe?.title}
      />
    </div>
  );
};

export default RecipeApprovalPage;