import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./SidebarAdmin.css";

const menuItems = [
  { name: "Tổng Quan", path: "/admin/dashboard", icon: "/image/home.png" },
  { name: "Người Dùng", path: "/admin/users", icon: "/image/user.png" },
  {
    name: "Món Ăn",
    icon: "/image/utensils.png",
    children: [
      { name: "Danh sách món ăn", path: "/admin/recipes" },
      { name: "Danh Mục", path: "/admin/danhmuc" },
      { name: "Duyệt Bài", path: "/admin/duyetbai" },
    ],
  },
  {
    name: "Bài Viết (Blog)",
    icon: "/image/book.png",
    children: [
      { name: "Tag", path: "/admin/articles/tags" },
      { name: "Danh sách bài viết", path: "/admin/articles" },
    ],
  },
  { name: "Liên Hệ", path: "/admin/lienhe", icon: "/image/envelope.png" },
];

const SidebarAdmin = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const isChildActive = (children) => {
    return children.some((child) => location.pathname === child.path);
  };

  return (
    <aside className="admin-sidebar">
      <nav>
        <ul>
          {menuItems.map((item) => {
            const isActiveParent = item.children && isChildActive(item.children);
            return (
              <li key={item.path || item.name}>
                {item.children ? (
                  <>
                    <div
                      className={`sidebar-link parent-link ${openMenu === item.name ? "open" : ""} ${isActiveParent ? "active" : ""}`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <img src={item.icon} alt="" className="sidebar-icon" />
                      <span className="sidebar-text">{item.name}</span>
                      <span className="arrow">{openMenu === item.name ? "▼" : "▶"}</span>
                    </div>
                    <ul className={`submenu ${openMenu === item.name ? "open" : ""}`}>
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            end
                            className={({ isActive }) =>
                              `sidebar-link ${isActive ? "active" : ""}`
                            }
                          >
                            <span className="sidebar-text">{child.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setOpenMenu(null)} // ✅ chỉ đóng khi click vào mục không có submenu
                  >
                    <img src={item.icon} alt="" className="sidebar-icon" />
                    <span className="sidebar-text">{item.name}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
