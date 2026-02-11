import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Layers } from 'lucide-react'; // <--- Додали Layers
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Дашборд', path: '/admin' },
    { icon: Package, label: 'Товари', path: '/admin/products' },
    { icon: Layers, label: 'Категорії', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Замовлення', path: '/admin/orders' },
    { icon: Users, label: 'Клієнти', path: '/admin/users' },
    { icon: Settings, label: 'Налаштування', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* SIDEBAR (Фіксований зліва) */}
      <aside className="w-64 bg-[#111] text-white flex flex-col fixed h-full z-20 shadow-xl">
        {/* Логотип */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition">
            PC<span className="text-green-500">ADMIN</span>
          </Link>
        </div>

        {/* Навігація */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-green-500 text-black shadow-lg shadow-green-900/20" 
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Блок користувача знизу */}
        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.fullName?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-300 py-2 rounded-lg transition-all text-sm font-medium border border-gray-700 hover:border-red-500/50"
          >
            <LogOut size={16} /> Вийти
          </button>
        </div>
      </aside>

      {/* CONTENT (Зсунутий вправо на ширину сайдбару) */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}