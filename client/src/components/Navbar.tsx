import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Cpu, User, Heart, Scale } from 'lucide-react'; // <--- 1. Додали Scale
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext'; // <--- 2. Імпорт хука
import { motion } from 'framer-motion';

export default function Navbar() {
  const { items } = useCart();
  const { user } = useAuth();
  const { favorites } = useWishlist();
  const { items: compareItems } = useComparison(); // <--- 3. Отримуємо товари для порівняння
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="bg-green-500 p-2 rounded-lg text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Cpu size={24} />
          </motion.div>
          <motion.span
            className="text-xl font-black tracking-tighter text-white"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            PC<span className="text-green-500">SHOP</span>
          </motion.span>
        </Link>

        {/* Пошук */}
        <div className="hidden md:flex items-center bg-white/5 px-4 py-2 rounded-full w-96 border border-white/10 focus-within:border-green-500 focus-within:bg-black transition-all">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Пошук комплектуючих..." 
            className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* Меню справа */}
        <div className="flex items-center gap-6">
          
          {/* Акаунт */}
          {user ? (
            <Link 
              to={user.role === 'ADMIN' ? "/admin" : "/profile"} 
              className="flex items-center gap-2 text-green-400 hover:text-white transition relative group"
              title={user.fullName}
            >
              <User size={24} />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black"></span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="text-white hover:text-green-400 transition relative"
            >
              <User size={24} />
            </Link>
          )}

          {/* --- ПОРІВНЯННЯ (AI) --- */}
          <Link to="/compare" className="relative cursor-pointer hover:scale-105 transition text-white hover:text-purple-400">
            <Scale size={24} />
            {compareItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {compareItems.length}
              </span>
            )}
          </Link>

          {/* --- ОБРАНЕ --- */}
          <Link to="/favorites" className="relative cursor-pointer hover:scale-105 transition text-white hover:text-red-500">
            <Heart size={24} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {favorites.length}
              </span>
            )}
          </Link>
          
          {/* Корзина */}
          <Link to="/cart" className="relative cursor-pointer hover:scale-105 transition text-white hover:text-green-400">
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {itemCount}
              </span>
            )}
          </Link>
          
          {/* Меню для мобіли */}
          <button className="md:hidden p-2 text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}