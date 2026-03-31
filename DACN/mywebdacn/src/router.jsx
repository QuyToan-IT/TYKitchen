import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
// --- Layouts ---
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';

// --- "Người gác cổng" cho các trang admin ---
import ProtectedRoute from './components/ProtectedRoute';

// --- Các trang công khai ---
import LoginRegister from './pages/LoginRegister';
import ArticleDetail from './pages/ArticleDetail';   // đổi từ BlogDetail
import Home from './pages/Home';
import AllRecipes from './pages/AllRecipes';
import RecipeDetail from './pages/RecipeDetail';
import AllArticles from './pages/AllArticles';       // đổi từ AllBlogs
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import AddRecipe from './pages/AddRecipes';
import AccessDeniedPage from './pages/AccessDeniedPage';


// --- Các trang quản trị (Admin) ---
import Dashboard from './pages/admin/Dashboard';
import CategoryPage from './pages/admin/CategoryPage';
import AddCategoryPage from './pages/admin/AddCategoryPage';
import EditCategoryPage from './pages/admin/EditCategoryPage';
import UsersPage from './pages/admin/UsersPage';
import RecipesPage from './pages/admin/RecipesPage';
import AddRecipePage from './pages/admin/AddRecipePage';
import RecipeDetailsPage from './pages/admin/RecipeDetailsPage';
import ArticlesPage from './pages/admin/ArticlesPage';       // đổi từ BlogsPage
import AddArticlePage from './pages/admin/AddArticlePage';   // đổi từ AddBlogPage
import EditArticlePage from './pages/admin/EditArticlePage'; // đổi từ EditBlogPage
import ArticleDetailsPage from './pages/admin/ArticleDetailsPage'; // đổi từ BlogApprovalPage
import ContactPage from './pages/admin/ContactPage';
import RecipeApprovalPage from './pages/admin/RecipeApprovalPage';
import RecipeEditPage from "./pages/admin/RecipeEditPage";
import TagPage from './pages/admin/TagPage';
import AddTagPage from './pages/admin/AddTagPage';
import EditTagPage from './pages/admin/EditTagPage';

// Layout chung cho các trang public
const PublicLayout = () => (
  <>
    <Header />
    <ScrollToTop />
    <main style={{ paddingTop: '100px', minHeight: 'calc(100vh - 100px)' }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <div style={{ padding: 24 }}>404 - Không tìm thấy trang</div>,
    children: [
      { index: true, element: <Home /> },
      { path: 'recipes', element: <AllRecipes /> },
      { path: 'recipes/new', element: <AddRecipe /> },
      { path: 'recipes/:id', element: <RecipeDetail /> },
      { path: 'articles', element: <AllArticles /> },       // đổi từ blogs
      { path: 'articles/:id', element: <ArticleDetail /> }, // đổi từ blogs/:slug
      { path: 'contact', element: <Contact /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/edit', element: <EditProfile /> },
      { path: 'users/:userId', element: <UserProfile /> },
    ],
  },
  {
    path: '/login',
    element: <LoginRegister />,
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'danhmuc', element: <CategoryPage /> },
      { path: 'danhmuc/them', element: <AddCategoryPage /> },
      { path: 'danhmuc/sua/:id', element: <EditCategoryPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'recipes', element: <RecipesPage /> },
      { path: 'recipes/add', element: <AddRecipePage /> },
      { path: 'recipes/details/:id', element: <RecipeDetailsPage /> },
      { path: 'articles', element: <ArticlesPage /> },             // đổi từ blogs
      { path: 'articles/add', element: <AddArticlePage /> },       // đổi từ blogs/add
      { path: 'articles/edit/:id', element: <EditArticlePage /> }, // đổi từ blogs/edit/:id
      { path: 'articles/details/:id', element: <ArticleDetailsPage /> }, // đổi từ blogs/details/:id
      { path: 'lienhe', element: <ContactPage /> },
      { path: 'duyetbai', element: <RecipeApprovalPage /> },
      { path: 'recipes/edit/:id', element: <RecipeEditPage /> },
      { path: 'articles/tags', element: <TagPage /> },             // đổi từ blogs/tags
      { path: 'articles/tags/add', element: <AddTagPage /> },
      { path: 'articles/tags/edit/:id', element: <EditTagPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
