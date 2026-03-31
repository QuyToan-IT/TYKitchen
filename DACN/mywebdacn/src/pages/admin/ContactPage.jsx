import React, { useState, useEffect } from "react";
import "./ContactPage.css";

// --- Helper: Map Enum sang Tiếng Việt hiển thị ---
const requestTypeMap = {
  HOP_TAC_QUANG_CAO: "Hợp tác/Quảng cáo",
  PHAN_HOI_CONG_THUC: "Phản hồi công thức",
  HO_TRO_KY_THUAT: "Hỗ trợ kỹ thuật",
  KHAC: "Khác",
};

// --- Helper: Map trạng thái từ boolean sang giao diện ---
const getStatusInfo = (isReplied) => {
  if (isReplied) {
    return { text: "Đã trả lời", className: "status-resolved" };
  }
  return { text: "Chờ xử lý", className: "status-pending" };
};

// --- Component: Thẻ thống kê (StatCard) ---
const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper" style={{ backgroundColor: color }}>
      {/* Đảm bảo ảnh icon có trong thư mục public/image/ */}
      <img src={`/image/${icon}`} alt={`${label} icon`} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// --- Component: Dòng dữ liệu (ContactRow) ---
const ContactRow = ({ contact, index, onView }) => {
  // FIX LỖI TRẠNG THÁI: Kiểm tra cả 2 trường hợp tên biến để chắc chắn lấy được true/false
  const isRepliedSafe = contact.isReplied || contact.replied;
  const statusInfo = getStatusInfo(isRepliedSafe);
  
  // FIX LỖI ESLINT: Lấy tên loại yêu cầu và SỬ DỤNG nó trong JSX bên dưới
  const displayType = requestTypeMap[contact.requestType] || contact.requestType;

  return (
    <div className="data-table-grid table-row">
      <span>{index + 1}</span>
      <span className="contact-name">{contact.name}</span>
      <span title={contact.email}>{contact.email}</span>
      
      {/* Hiển thị Chủ đề và Loại yêu cầu (Sử dụng displayType ở đây) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="contact-subject" style={{ fontWeight: '500' }}>{contact.subject}</span>
          <span style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            🏷️ {displayType}
          </span> 
      </div>

      <td>
        <span className={`status-badge ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
      </td>
      <td className="action-cell">
        <button className="action-btn view-btn" onClick={() => onView(contact)}>
          Xem & Trả lời
        </button>
      </td>
    </div>
  );
};

// --- Component: Modal chi tiết & Trả lời (ContactModal) ---
const ContactModal = ({ contact, isOpen, onClose, onReplySuccess }) => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen && contact) {
      setReply(contact.replyMessage || ""); // Nếu đã trả lời trước đó thì hiện lại nội dung cũ
    }
  }, [isOpen, contact]);

  if (!isOpen || !contact) return null;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return alert("Vui lòng nhập nội dung trả lời!");

    setLoading(true);
    try {
      // FIX LỖI TOKEN: Dùng đúng key 'jwtToken'
      const token = localStorage.getItem("jwtToken");
      
      const response = await fetch(`http://localhost:8888/api/v1/contacts/${contact.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: reply })
      });

      if (response.ok) {
        alert("✅ Đã gửi phản hồi qua email thành công!");
        onReplySuccess(); // Gọi hàm này để load lại danh sách bên ngoài
        onClose();
      } else {
        alert("❌ Lỗi khi gửi phản hồi: " + response.statusText);
      }
    } catch (error) {
      console.error("Error replying:", error);
      alert("❌ Lỗi kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const displayType = requestTypeMap[contact.requestType] || contact.requestType;
  
  // FIX LỖI TRẠNG THÁI trong Modal
  const isRepliedSafe = contact.isReplied || contact.replied;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRepliedSafe ? "CHI TIẾT PHẢN HỒI (ĐÃ TRẢ LỜI)" : "TRẢ LỜI LIÊN HỆ"}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleReplySubmit}>
          <div className="form-row-2">
            <div className="form-field">
                <label>Người gửi:</label>
                <input type="text" value={`${contact.name} (${contact.email})`} readOnly />
            </div>
            <div className="form-field">
                <label>Loại yêu cầu:</label>
                <input type="text" value={displayType} readOnly />
            </div>
          </div>
          
          <div className="form-field">
            <label>Chủ đề:</label>
            <input type="text" value={contact.subject} readOnly />
          </div>
          
          <div className="form-field full-width">
            <label>Nội dung tin nhắn:</label>
            <textarea value={contact.message} readOnly rows="4" style={{backgroundColor: '#f9f9f9'}}></textarea>
          </div>

          <div className="form-field full-width">
            <label>Nội dung trả lời (Gửi qua Email):</label>
            <textarea 
                placeholder="Nhập nội dung để phản hồi cho khách hàng..." 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                rows="5"
            ></textarea>
          </div>

          <div className="form-field full-width modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Đóng</button>
            <button type="submit" className="reply-button" disabled={loading}>
                {loading ? "ĐANG GỬI..." : "GỬI PHẢN HỒI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Component Chính (ContactPage) ---
const ContactPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Thống kê
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0 });

  // Hàm gọi API lấy danh sách
  const fetchContacts = async () => {
    try {
      // FIX LỖI TOKEN: Dùng đúng key 'jwtToken'
      const token = localStorage.getItem("jwtToken");

      // FIX LỖI CACHE: Thêm tham số ?t= thời gian để trình duyệt không cache dữ liệu cũ
      const response = await fetch(`http://localhost:8888/api/v1/contacts?t=${new Date().getTime()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` // Bắt buộc phải có Token ADMIN
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
        
        // Tính toán thống kê
        const total = data.length;
        // Kiểm tra cả 2 key boolean để đếm đúng số lượng đã trả lời
        const replied = data.filter(c => c.isReplied || c.replied).length;
        const pending = total - replied;
        setStats({ total, pending, replied });
      } else {
        if (response.status === 403) alert("Bạn không có quyền truy cập trang này (Cần quyền ADMIN)!");
        if (response.status === 401) alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component load lần đầu
  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="contact-page-container">
      <h1 className="page-title">Quản Lý Liên Hệ & Hỗ Trợ</h1>

      {/* Phần thống kê động */}
      <div className="stats-row">
        <StatCard icon="hopthu.png" value={stats.total} label="Tổng Liên Hệ" color="#EBF2FF" />
        <StatCard icon="time.png" value={stats.pending} label="Chờ Trả Lời" color="#FFF8E6" />
        <StatCard icon="tick.png" value={stats.replied} label="Đã Giải Quyết" color="#E6FFF6" />
      </div>

      <div className="data-table-container">
        <div className="data-table-grid table-header">
          <span>STT</span>
          <span>Họ Tên</span>
          <span>Email</span>
          <span>Chủ Đề & Loại</span>
          <span>Trạng Thái</span>
          <span style={{ textAlign: 'center' }}>Hành động</span>
        </div>
        
        {loading ? (
            <div style={{padding: 20, textAlign: 'center'}}>Đang tải dữ liệu...</div>
        ) : contacts.length === 0 ? (
            <div style={{padding: 20, textAlign: 'center'}}>Chưa có liên hệ nào.</div>
        ) : (
            contacts.map((contact, index) => (
              <ContactRow 
                key={contact.id} 
                contact={contact} 
                index={index} 
                onView={handleViewContact} 
              />
            ))
        )}
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        contact={selectedContact}
        onReplySuccess={fetchContacts} // Load lại danh sách sau khi trả lời xong
      />
    </div>
  );
};

export default ContactPage;