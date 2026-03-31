import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "40px 0",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: 28,
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            flexWrap: "wrap",
          }}
        >
          {/* Thông tin giới thiệu */}
          <div style={{ width: "100%", maxWidth: 480, minWidth: 260 }}>
            <div
              style={{
                color: "black",
                fontSize: 24,
                fontFamily: "Lobster, cursive",
                fontWeight: 400,
                marginBottom: 8,
              }}
            >
              Bếp của Ty
            </div>
            <p
              style={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: 16,
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                lineHeight: "28px",
                marginBottom: 12,
              }}
            >
              Chia sẻ niềm đam mê nấu nướng và những công thức đơn giản, dễ làm tại nhà.
            </p>
          </div>

          {/* Menu Điều hướng */}
          <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link
              to="/recipes"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: 500,
              }}
            >
              MÓN ĂN
            </Link>
            <Link
              to="/blogs"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: 500,
              }}
            >
              BÀI VIẾT
            </Link>
            <Link
              to="/contact"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: 500,
              }}
            >
              LIÊN HỆ
            </Link>
            <Link
              to="/about"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: 500,
              }}
            >
              GIỚI THIỆU
            </Link>
          </nav>
        </div>

        {/* Phần dưới: Copyright + Social Icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 12,
            paddingBottom: 12,
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {/* Copyright */}
          <div
            style={{
              color: "rgba(0, 0, 0, 0.6)",
              fontSize: 16,
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              flexGrow: 1,
              textAlign: "left",
              minWidth: 200,
            }}
          >
            © 2025 Flowbase. Powered by <span style={{ color: "#FF7967" }}>WyWeb</span>
          </div>

          {/* Social Icons */}
          <div
            style={{
              display: "flex",
              gap: 15,
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <a href="#" aria-label="Facebook">
              <img
                src="/image/facebook.png"
                alt="Facebook"
                style={{ width: 20, height: 20 }}
              />
            </a>
            <a href="#" aria-label="Twitter">
              <img
                src="/image/twitter.png"
                alt="Twitter"
                style={{ width: 20, height: 20 }}
              />
            </a>
            <a href="#" aria-label="Instagram">
              <img
                src="/image/instagram.png"
                alt="Instagram"
                style={{ width: 20, height: 20 }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}