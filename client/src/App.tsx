import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // <--- 1. Імпорт тостера

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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// --- СТОРІНКИ АДМІНКИ ---
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// Обгортка для публічних сторінок
const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      {/* 2. НАЛАШТУВАННЯ СПОВІЩЕНЬ (Toaster) 
          Він має бути тут, щоб працювати і в адмінці, і в магазині.
      */}
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e', // Зелений колір успіху
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Червоний колір помилки
              secondary: '#fff',
            },
          },
        }} 
      />

      <AuthProvider>
        <CartProvider>
          <Routes>
            
            {/* === ГРУПА 1: ПУБЛІЧНИЙ МАГАЗИН === */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/catalog" element={<Home />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* === ГРУПА 2: ЗАХИЩЕНА АДМІНКА === */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />

                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                
                {/* Налаштування */}
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;