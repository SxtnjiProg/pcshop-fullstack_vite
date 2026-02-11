import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Package, Heart, Scale, MessageSquare, 
  Bot, Settings, LogOut, ChevronRight 
} from 'lucide-react';

export default function ProfileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Мій кабінет', path: '/profile', icon: User, end: true },
    { label: 'Мої замовлення', path: '/profile/orders', icon: Package },
    { label: 'Обране', path: '/profile/wishlist', icon: Heart },
    { label: 'Порівняння', path: '/compare', icon: Scale },
    { label: 'Мої відгуки', path: '/profile/reviews', icon: MessageSquare },
    { label: 'AI-Помічник', path: '/profile/ai', icon: Bot, highlight: true }, // Особливий пункт
    { label: 'Налаштування', path: '/profile/settings', icon: Settings },
  ];

  if (!user) return <div className="h-screen flex items-center justify-center">Завантаження...</div>;

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4">
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
           <span>Головна</span> <ChevronRight size={14} /> <span className="text-gray-900">Кабінет</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* === SIDEBAR (STICKY) === */}
          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            
            {/* Міні-профіль в меню */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <p className="text-xs text-gray-500 mb-1">Вітаємо,</p>
               <p className="font-bold text-gray-900 text-lg truncate">{user.fullName}</p>
               <p className="text-xs text-green-600 font-medium mt-1">Premium клієнт ✨</p>
            </div>

            <nav className="p-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm
                    ${isActive 
                      ? 'bg-green-50 text-green-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${item.highlight && !isActive ? 'text-purple-600 hover:bg-purple-50' : ''}
                  `}
                >
                  <item.icon size={18} className={item.highlight ? "text-purple-600" : ""} />
                  <span>{item.label}</span>
                  {item.highlight && <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>}
                </NavLink>
              ))}
              
              <div className="my-2 border-t border-gray-100"></div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all font-medium text-sm text-left"
              >
                <LogOut size={18} />
                <span>Вийти</span>
              </button>
            </nav>
          </aside>

          {/* === CONTENT AREA === */}
          <main className="min-h-[500px]">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}