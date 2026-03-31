import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    // Cấu hình Proxy để chuyển tiếp yêu cầu API từ cổng 5173 sang 8080.
    proxy: {
      '/api': { 
        target: 'http://localhost:8888', // Sửa thành cổng 8081 của backend
        changeOrigin: true,             // Bắt buộc để khắc phục lỗi CORS
        secure: false,                  // Quan trọng: Tắt kiểm tra SSL/TLS cho localhost
        ws: true,                       // Hỗ trợ WebSocket (nếu cần)
      },
    },
  },
})