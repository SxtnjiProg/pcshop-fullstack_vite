import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// --- ЛЕЙАУТИ ---
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';

// --- КОМПОНЕНТИ ЗАХИСТУ ---
import AdminRoute from './components/AdminRoute';

// --- СТОРІНКИ МАГАЗИНУ ---
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage'; // <--- 1. ДОДАВ ІМПОРТ
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import ComparePage from './pages/ComparePage';

// --- СТОРІНКИ ПРОФІЛЮ ---
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileDashboard from './pages/profile/ProfileDashboard';
import ProfileOrders from './pages/profile/ProfileOrders';
import ProfileAI from './pages/profile/ProfileAI';

// --- СТОРІНКИ АДМІНКИ ---
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';


// Обгортка для публічних сторінок (Шапка + Футер)
const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: { background: '#333', color: '#fff', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} 
      />

      <AuthProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <CartProvider>
              <Routes>
                
                {/* === ГРУПА 1: МАГАЗИН І ПРОФІЛЬ (Доступно всім / юзерам) === */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/catalog" element={<Home />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} /> {/* <--- 2. ДОДАВ РОУТ */}
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ПРОФІЛЬ КОРИСТУВАЧА */}
                  <Route path="/profile" element={<ProfileLayout />}>
                    <Route index element={<ProfileDashboard />} />
                    <Route path="orders" element={<ProfileOrders />} />
                    <Route path="wishlist" element={<FavoritesPage />} />
                    <Route path="reviews" element={<div className="p-10 text-center">Мої відгуки (Скоро)</div>} />
                    <Route path="ai" element={<ProfileAI />} />
                    <Route path="settings" element={<div className="p-10 text-center">Налаштування</div>} />
                  </Route>
                </Route>

                {/* === ГРУПА 2: ТІЛЬКИ АДМІНКА === */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/edit/:id" element={<ProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

              </Routes>
            </CartProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;