import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ Thêm dòng này
import './index.css'
import AppRouter from './router.jsx'

// Thay thế bằng Client ID bạn lấy được từ Google Cloud Console
const GOOGLE_CLIENT_ID = "290492023692-qddn01oqnmg9cb91sv3gd162g8pdsm9l.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ Bọc toàn bộ App trong Provider này */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppRouter />
    </GoogleOAuthProvider>
  </StrictMode>,
)