import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Nhớ cài: npm install jwt-decode
import "./Contact.css";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    type: "",
    message: "",
  });

  // --- MỚI: Tự động điền thông tin nếu đã đăng nhập ---
  useEffect(() => {
    const autoFillUserInfo = async () => {
      // 1. Lấy token đúng key 'jwtToken'
      const token = localStorage.getItem("jwtToken");

      if (token) {
        try {
          // 2. Giải mã token để lấy userId
          const decoded = jwtDecode(token);
          const userId = decoded.userId; // Hoặc decoded.sub tùy vào cấu hình backend

          // 3. Gọi API lấy thông tin chi tiết User
          const response = await fetch(`http://localhost:8888/api/v1/users/${userId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            
            // 4. Cập nhật vào form (Giữ nguyên các trường khác, chỉ điền name/email)
            setForm(prev => ({
              ...prev,
              name: userData.fullName || userData.username || "", // Ưu tiên FullName
              email: userData.email || "" //
            }));
          }
        } catch (error) {
          console.error("Lỗi khi tự động lấy thông tin user:", error);
          // Nếu lỗi thì thôi, để user tự nhập, không cần alert làm phiền
        }
      }
    };

    autoFillUserInfo();
  }, []); // Chạy 1 lần khi mount

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.id]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      subject: form.subject,
      requestType: form.type,
      message: form.message,
    };

    // Lấy token để gửi kèm request (Authorization)
    const token = localStorage.getItem("jwtToken");

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch("http://localhost:8888/api/v1/contacts", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("✅ Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.");
        
        // Reset form (Giữ lại name/email nếu đang đăng nhập cho tiện, hoặc xóa hết tùy bạn)
        // Ở đây mình chọn cách xóa nội dung, giữ lại thông tin cá nhân
        setForm(prev => ({
          ...prev,
          subject: "",
          type: "",
          message: "",
          // Nếu muốn reset sạch sẽ thì bỏ dòng dưới đi
          // name: token ? prev.name : "", 
          // email: token ? prev.email : ""
        }));
        
        // Hoặc reset sạch:
        /*
        setForm({
            name: "", email: "", subject: "", type: "", message: ""
        });
        */
       
      } else {
        const errorData = await response.text();
        alert("❌ Có lỗi xảy ra: " + errorData);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("❌ Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const onSubscribe = (e) => {
    e.preventDefault();
    alert("Chức năng đăng ký đang được phát triển!");
  };

  return (
    <main className="contact-page">
      <div className="contact-container">
        <h1 className="page-title">LIÊN HỆ VỚI BẾP CỦA TY</h1>

        <div className="contact-grid">
          <div className="contact-image-section">
            <img
              src="/image/lienhe.png"
              alt="Bếp Của Ty"
              className="contact-image"
            />
          </div>

          <div className="form-section">
            <form onSubmit={onSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Tên của bạn..."
                    required
                    value={form.name}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Địa chỉ Email của bạn..."
                    required
                    value={form.email}
                    onChange={onChange}
                    // Có thể thêm readOnly nếu không muốn user sửa email đăng nhập
                    // readOnly={!!localStorage.getItem("jwtToken")} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="form-input"
                    placeholder="Lý do ngắn gọn"
                    required
                    value={form.subject}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Loại Yêu cầu
                  </label>
                  <select
                    id="type"
                    className="form-select"
                    required
                    value={form.type}
                    onChange={onChange}
                  >
                    <option value="" disabled hidden>
                      Chọn loại yêu cầu
                    </option>
                    <option value="HOP_TAC_QUANG_CAO">Hợp tác/Quảng cáo</option>
                    <option value="PHAN_HOI_CONG_THUC">
                      Phản hồi công thức
                    </option>
                    <option value="HO_TRO_KY_THUAT">Hỗ trợ kỹ thuật</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="message" className="form-label">
                  Tin nhắn
                </label>
                <textarea
                  id="message"
                  className="form-textarea"
                  placeholder="Nội dung tin nhắn của bạn..."
                  required
                  value={form.message}
                  onChange={onChange}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "ĐANG GỬI..." : "GỬI TIN NHẮN"}
              </button>
            </form>
          </div>
        </div>

        <section className="subscribe-section">
          <div className="subscribe-content">
            <h2 className="subscribe-title">Món Ngon Đến Hộp Thư Của Bạn</h2>
            <p className="subscribe-subtitle">
              Đăng ký ngay để không bỏ lỡ những công thức nấu ăn mới, mẹo vặt nhà
              bếp và ưu đãi đặc biệt từ "Bếp của Ty".
            </p>
            <form className="subscribe-form" onSubmit={onSubscribe}>
              <div className="subscribe-input-wrapper">
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn..."
                  required
                />
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