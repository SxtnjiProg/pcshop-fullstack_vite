import { useOutlet, NavLink, useNavigate, useLocation } from 'react-router-dom'; // 1. Додали useOutlet
import { useAuth } from '../../context/AuthContext';
import { User, Package, Lock, Bot, LogOut, ChevronRight, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ProfileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const element = useOutlet(); // 2. "Захоплюємо" поточну сторінку в змінну
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Особисті дані', path: '/profile', icon: User, end: true },
    { label: 'Мої замовлення', path: '/profile/orders', icon: Package },
    { label: 'Список бажань', path: '/profile/wishlist', icon: Heart },
    { label: 'Безпека', path: '/profile/security', icon: Lock },
    { label: 'AI Асистент', path: '/profile/ai', icon: Bot },
  ];

  if (!user) return <div className="p-10 text-center text-gray-500">Завантаження...</div>;

  return (
    <div className="bg-[#f4f6f8] min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Хлібні крихти */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 mb-10">
          <span
            className="hover:text-green-600 cursor-pointer transition-colors"
            onClick={() => navigate('/')}
          >
            Головна
          </span> 
          <ChevronRight size={12} /> 
          <span className="text-gray-600">Особистий кабінет</span>
        </div>

        {/* Мобільне меню */}
        <div className="flex lg:hidden mb-6 justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <User size={20} className="text-green-600" />
             </div>
             <div>
                <h2 className="text-sm font-bold">{user.fullName}</h2>
                <p className="text-xs text-gray-400">Мій кабінет</p>
             </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 relative">

          {/* SIDEBAR */}
          <aside
            className={`
              bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 
              w-full lg:w-72 flex-shrink-0 space-y-6 z-40 transition-all duration-300
              ${isSidebarOpen ? 'absolute top-0 left-0 w-full shadow-2xl' : 'hidden lg:block'}
            `}
          >
            <div className="text-center pb-6 border-b border-gray-50">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <User size={36} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold truncate px-2">{user.fullName}</h2>
              <p className="text-gray-400 text-xs truncate px-2">{user.email}</p>
            </div>

            <nav className="flex flex-col space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200 transform scale-[1.02]'
                      : 'text-gray-500 hover:bg-green-50 hover:text-green-700 hover:pl-7'}`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}

              <div className="h-px bg-gray-50 my-4 mx-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-2xl transition-all text-left hover:pl-7"
              >
                <LogOut size={18} />
                Вийти
              </button>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 w-full min-w-0">
             {/* 3. Використовуємо {element} замість <Outlet />.
                Це фіксує компонент сторінки, щоб анімація не збивалась.
             */}
             <AnimatePresence mode="wait">
                {element && (
                  <motion.div
                    key={location.pathname} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.25 }}
                    className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[500px]"
                  >
                    {element}
                  </motion.div>
                )}
             </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}