import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import "./Dashboard.css";

// Component cho mỗi thẻ thống kê để tái sử dụng
const StatCard = ({ icon, label, value, bgColor }) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper" style={{ background: bgColor }}>
      <img src={`/image/${icon}`} alt={`${label} icon`} />
    </div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth(); // Đảm bảo hook này trả về đúng token (jwtToken)
  const [stats, setStats] = useState({
    recipes: 0,
    articles: 0,
    users: 0,
    contacts: 0, 
  });
  const [recipeChartData, setRecipeChartData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Nếu không có token từ hook, thử lấy thủ công từ localStorage để chắc chắn
      const authToken = token || localStorage.getItem("jwtToken");

      if (!authToken) return;

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${authToken}` };

        // ✅ THÊM API CONTACT VÀO PROMISE.ALL
        const [recipesRes, articlesRes, usersRes, contactsRes] = await Promise.all([
          fetch("http://localhost:8888/api/v1/recipes", { headers }),
          fetch("http://localhost:8888/api/v1/articles", { headers }),
          fetch("http://localhost:8888/api/v1/users", { headers }),
          fetch("http://localhost:8888/api/v1/contacts", { headers }), // <--- MỚI THÊM
        ]);

        if (!recipesRes.ok || !articlesRes.ok || !usersRes.ok || !contactsRes.ok) {
          throw new Error("Không thể tải dữ liệu thống kê");
        }

        const recipesData = await recipesRes.json();
        const articlesData = await articlesRes.json();
        const usersData = await usersRes.json();
        const contactsData = await contactsRes.json(); // <--- MỚI THÊM

        // Xử lý dữ liệu cho biểu đồ món ăn theo danh mục
        const recipesByCategory = recipesData.reduce((acc, recipe) => {
          const category = recipe.categoryName || "Chưa phân loại";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(recipesByCategory).map((key) => ({
          name: key,
          value: recipesByCategory[key],
        }));
        setRecipeChartData(chartData);

        // ✅ CẬP NHẬT STATE VỚI SỐ LƯỢNG LIÊN HỆ THỰC TẾ
        setStats({
          recipes: recipesData.length,
          articles: articlesData.length,
          users: usersData.length,
          contacts: contactsData.length, // Lấy độ dài mảng contacts
        });

        // --- MÔ PHỎNG LẤY DỮ LIỆU LƯỢT TRUY CẬP TỪ DB ---
        setTimeout(() => {
          const mockTrafficData = [
            { date: "Ngày 1", visits: 120 },
            { date: "Ngày 5", visits: 250 },
            { date: "Ngày 10", visits: 180 },
            { date: "Ngày 15", visits: 300 },
            { date: "Ngày 20", visits: 280 },
            { date: "Ngày 25", visits: 450 },
            { date: "Ngày 30", visits: 400 },
          ];
          setTrafficData(mockTrafficData);
        }, 500); 

      } catch (err) {
        setError(err.message);
        console.error("Lỗi khi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    { icon: "tuongtac.png", label: "Món Ăn Đã Đăng", value: stats.recipes, bgColor: "#DCFAF8" },
    { icon: "luotxem.png", label: "Các Bài Viết Đã Đăng", value: stats.articles, bgColor: "#FFE0EB" },
    { icon: "thanhvien.png", label: "Tổng số Thành Viên", value: stats.users, bgColor: "#EBF2FF" },
    { icon: "hopthu.png", label: "Liên hệ", value: stats.contacts, bgColor: "#FFDDC1" },
  ];

  // Modern color palette for charts
  const CHART_COLORS = [
    "#4c84ee", // Primary Blue
    "#00C49F", // Teal
    "#FFBB28", // Amber
    "#FF8042", // Coral
    "#AF19FF", // Purple
    "#FF6B9D", // Pink
  ];

  // Custom Tooltip for Line Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#4c84ee' }}>
            {payload[0].value} lượt truy cập
          </p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="dashboard-body">
      <h1 className="dashboard-title">THỐNG KÊ</h1>
      
      {/* Phần trên: Thống kê và các biểu đồ */}
      <div className="dashboard-top-section">
        {/* Lưới thống kê */}
        <div className="dashboard-stats-grid">
          {loading ? (
            <p>Đang tải thống kê...</p>
          ) : error ? (
            <p>Lỗi: {error}</p>
          ) : (
            statCards.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                bgColor={stat.bgColor}
              />
            ))
          )}
        </div>

        {/* Biểu đồ tròn - Món ăn theo danh mục */}
        <div className="chart-panel pie-chart-panel">
          <h2>MÓN ĂN THEO DANH MỤC</h2>
          <div className="chart-container">
            {loading ? (
              <div className="chart-placeholder">Đang tải dữ liệu biểu đồ...</div>
            ) : recipeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie 
                    data={recipeChartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {recipeChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e8ecf4',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    iconType="circle"
                    wrapperStyle={{ 
                      fontSize: '12px', 
                      paddingTop: '20px',
                      lineHeight: '1.8'
                    }}
                    formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">Không có dữ liệu để hiển thị</div>
            )}
          </div>
        </div>
      </div>

      <hr />

      <div className="dashboard-bottom-section">
        <div className="chart-panel" style={{ flex: "1 1 auto", minWidth: "500px" }}>
          <h2>LƯỢT TRUY CẬP TRANG WEB TRONG THÁNG</h2>
          <div className="chart-container">
            {loading ? (
              <div className="chart-placeholder">Đang tải dữ liệu biểu đồ...</div>
            ) : trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={trafficData} 
                  margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4c84ee" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4c84ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#718ebf' }}
                    axisLine={{ stroke: '#e8ecf4' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#718ebf' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="line"
                    wrapperStyle={{ fontSize: '13px', paddingBottom: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    name="Lượt truy cập" 
                    stroke="#4c84ee" 
                    strokeWidth={3}
                    dot={{ fill: '#4c84ee', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#4c84ee', stroke: '#fff', strokeWidth: 2 }}
                    fill="url(#colorVisits)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">Không có dữ liệu để hiển thị</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;