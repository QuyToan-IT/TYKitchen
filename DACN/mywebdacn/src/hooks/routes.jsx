import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- Layouts (Giả định bạn có các file layout này) ---
// import MainLayout from './layouts/MainLayout';
// import AdminLayout from './layouts/AdminLayout';

// --- "Người gác cổng" cho các trang admin ---
import ProtectedRoute from './components/ProtectedRoute';

// --- Các trang công khai ---
import LoginRegister from './pages/LoginRegister';
import BlogDetail from './pages/BlogDetail';
// import HomePage from './pages/HomePage'; // Giả định có trang chủ

// --- Các trang quản trị (Admin) ---
import CategoryPage from './pages/admin/CategoryPage';
import AddCategoryPage from './pages/admin/AddCategoryPage';
import AddRecipe from './pages/AddRecipes';
// import AdminDashboard from './pages/admin/AdminDashboard'; // Giả định có trang dashboard

const router = createBrowserRouter([
  {
    // --- Các trang công khai ---
    // path: '/',
    // element: <MainLayout />, // Bọc các trang public trong một layout chung
    children: [
      // { index: true, element: <HomePage /> },
      {
        path: '/login',
        element: <LoginRegister />,
      },
      {
        path: '/blogs/:slug',
        element: <ArticleDetail />,
      },
    ],
  },
  {
    // --- Các trang quản trị được bảo vệ ---
    path: '/admin',
    element: <ProtectedRoute />, // "Người gác cổng" sẽ kiểm tra quyền trước
    // element: <AdminLayout />, // Bọc các trang admin trong layout của admin
    children: [
      // { index: true, element: <AdminDashboard /> },
      {
        path: 'danhmuc',
        element: <CategoryPage />,
      },
      {
        path: 'danhmuc/them',
        element: <AddCategoryPage />,
      },
      {
        path: 'recipes/add',
        element: <AddRecipe />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}