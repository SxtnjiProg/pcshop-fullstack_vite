import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, token } = useAuth();

  // 1. Якщо користувач не залогінений
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Якщо користувач залогінений, але він не Адмін
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 3. Якщо все ок — показуємо адмінку
  return <Outlet />;
}